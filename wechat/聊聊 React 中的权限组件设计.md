> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/yPNRbCunoAjNwPD472nXFg)

1 背景
----

权限管理是中后台系统中常见的需求之一。之前做过基于 Vue 的后台管理系统权限控制 [1]，基本思路就是在一些路由钩子里做权限比对和拦截处理。

最近维护的一个后台系统需要加入权限管理控制，这次技术栈是`React`，我刚开始是在网上搜索一些`React路由权限控制`，但是没找到比较好的方案或思路。

这时想到`ant design pro`内部实现过权限管理，因此就专门花时间翻阅了一波源码，并在此基础上逐渐完成了这次的权限管理。

整个过程也是遇到了很多问题，本文主要来做一下此次改造工作的总结。

> 原代码基于 react 16.x、dva 2.4.1 实现，所以本文是参考了 ant-design-pro v1[2] 内部对权限管理的实现

2 所谓的权限控制是什么？
-------------

一般后台管理系统的权限涉及到两种：

*   资源权限
    
*   数据权限
    

资源权限一般指菜单、页面、按钮等的可见权限。

数据权限一般指对于不同用户，同一页面上看到的数据不同。

本文主要是来探讨一下资源权限，也就是前端权限控制。这又分为了两部分：

*   侧边栏菜单
    
*   路由权限
    

在很多人的理解中，前端权限控制就是左侧菜单的可见与否，其实这是不对的。举一个例子，假设用户`guest`没有路由`/setting`的访问权限，但是他知道`/setting`的完整路径，直接通过输入路径的方式访问，此时仍然是可以访问的。这显然是不合理的。这部分其实就属于路由层面的权限控制。

3 实现思路
------

关于前端权限控制一般有两种方案：

*   前端固定路由表和权限配置，由后端提供用户权限标识
    
*   后端提供权限和路由信息结构接口，动态生成权限和菜单
    

我们这里采用的是第一种方案，服务只下发当前用户拥有的角色就可以了，路由表和权限的处理统一在前端处理。

整体实现思路也比较简单：现有权限（`currentAuthority`）和准入权限（`authority`）做比较，如果匹配则渲染和准入权限匹配的组件，否则渲染`无权限组件`（403 页面）

![](https://mmbiz.qpic.cn/mmbiz_png/DByMFBAKmy56ftmApH0Gxtu8nx4vQmBibwZ1z5G0EE6KgF2SNTtPDznHHjyRX7ObLqTgQHydib1j7rxZLxCibk6lA/640?wx_fmt=png)

4 路由权限
------

既然是路由相关的权限控制，我们免不了先看一下当前的路由表：

```
{    "name": "活动列表",    "path": "/activity-mgmt/list",    "key": "/activity-mgmt/list",    "exact": true,    "authority": [        "admin"    ],    "component": ƒ LoadableComponent(props),    "inherited": false,    "hideInBreadcrumb": false},{    "name": "优惠券管理",    "path": "/coupon-mgmt/coupon-rule-bplist",    "key": "/coupon-mgmt/coupon-rule-bplist",    "exact": true,    "authority": [        "admin",        "coupon"    ],    "component": ƒ LoadableComponent(props),    "inherited": true,    "hideInBreadcrumb": false},{    "name": "营销录入系统",    "path": "/marketRule-manage",    "key": "/marketRule-manage",    "exact": true,    "component": ƒ LoadableComponent(props),    "inherited": true,    "hideInBreadcrumb": false}
```

> 这份路由表其实是我从控制台 copy 过来的，内部做了很多的转换处理，但最终生成的就是上面这个对象。

这里每一级菜单都加了一个`authority`字段来标识允许访问的角色。`component`代表路由对应的组件：

```
import React, { createElement } from "react"import Loadable from "react-loadable""/activity-mgmt/list": {    component: dynamicWrapper(app, ["activityMgmt"], () => import("../routes/activity-mgmt/list"))},// 动态引用组件并注册modelconst dynamicWrapper = (app, models, component) => {  // register models  models.forEach(model => {    if (modelNotExisted(app, model)) {      // eslint-disable-next-line      app.model(require(`../models/${model}`).default)    }  })  // () => require('module')  // transformed by babel-plugin-dynamic-import-node-sync  // 需要将routerData塞到props中  if (component.toString().indexOf(".then(") < 0) {    return props => {      return createElement(component().default, {        ...props,        routerData: getRouterDataCache(app)      })    }  }  // () => import('module')  return Loadable({    loader: () => {      return component().then(raw => {        const Component = raw.default || raw        return props =>          createElement(Component, {            ...props,            routerData: getRouterDataCache(app)          })      })    },    // 全局loading    loading: () => {      return (        <div          style={{            display: "flex",            justifyContent: "center",            alignItems: "center"          }}        >          <Spin size="large" class />        </div>      )    }  })}
```

有了路由表这份基础数据，下面就让我们来看下如何通过一步步的改造给原有系统注入权限。

先从`src/router.js`这个入口开始着手：

```
// 原src/router.jsimport dynamic from "dva/dynamic"import { Redirect, Route, routerRedux, Switch } from "dva/router"import PropTypes from "prop-types"import React from "react"import NoMatch from "./components/no-match"import App from "./routes/app"const { ConnectedRouter } = routerReduxconst RouterConfig = ({ history, app }) => {  const routes = [    {      path: "activity-management",      models: () => [import("@/models/activityManagement")],      component: () => import("./routes/activity-mgmt")    },    {      path: "coupon-management",      models: () => [import("@/models/couponManagement")],      component: () => import("./routes/coupon-mgmt")    },    {      path: "order-management",      models: () => [import("@/models/orderManagement")],      component: () => import("./routes/order-maint")    },    {      path: "merchant-management",      models: () => [import("@/models/merchantManagement")],      component: () => import("./routes/merchant-mgmt")    }    // ...  ]  return (    <ConnectedRouter history={history}>      <App>        <Switch>          {routes.map(({ path, ...dynamics }, key) => (            <Route              key={key}              path={`/${path}`}              component={dynamic({                app,                ...dynamics              })}            />          ))}          <Route component={NoMatch} />        </Switch>      </App>    </ConnectedRouter>  )}RouterConfig.propTypes = {  history: PropTypes.object,  app: PropTypes.object}export default RouterConfig
```

这是一个非常常规的路由配置，既然要加入权限，比较合适的方式就是包一个高阶组件`AuthorizedRoute`。然后`router.js`就可以更替为：

```
function RouterConfig({ history, app }) {  const routerData = getRouterData(app)  const BasicLayout = routerData["/"].component  return (    <ConnectedRouter history={history}>      <Switch>        <AuthorizedRoute path="/" render={props => <BasicLayout {...props} />} />      </Switch>    </ConnectedRouter>  )}
```

来看下`AuthorizedRoute`的大致实现：

```
const AuthorizedRoute = ({  component: Component,  authority,  redirectPath,  {...rest}}) => {  if (authority === currentAuthority) {    return (      <Route      {...rest}      render={props => <Component {...props} />} />    )  } else {    return (      <Route {...rest} render={() =>        <Redirect to={redirectPath} />      } />    )  }}
```

我们看一下这个组件有什么问题：页面可能允许多个角色访问，用户拥有的角色也可能是多个（可能是字符串，也可呢是数组）。

直接在组件中判断显然不太合适，我们把这部分逻辑抽离出来：

```
/** * 通用权限检查方法 * Common check permissions method * @param { 菜单访问需要的权限 } authority * @param { 当前角色拥有的权限 } currentAuthority * @param { 通过的组件 Passing components } target * @param { 未通过的组件 no pass components } Exception */const checkPermissions = (authority, currentAuthority, target, Exception) => {  console.log("checkPermissions -----> authority", authority)  console.log("currentAuthority", currentAuthority)  console.log("target", target)  console.log("Exception", Exception)  // 没有判定权限.默认查看所有  // Retirement authority, return target;  if (!authority) {    return target  }  // 数组处理  if (Array.isArray(authority)) {    // 该菜单可由多个角色访问    if (authority.indexOf(currentAuthority) >= 0) {      return target    }    // 当前用户同时拥有多个角色    if (Array.isArray(currentAuthority)) {      for (let i = 0; i < currentAuthority.length; i += 1) {        const element = currentAuthority[i]        // 菜单访问需要的角色权限 < ------ > 当前用户拥有的角色        if (authority.indexOf(element) >= 0) {          return target        }      }    }    return Exception  }  // string 处理  if (typeof authority === "string") {    if (authority === currentAuthority) {      return target    }    if (Array.isArray(currentAuthority)) {      for (let i = 0; i < currentAuthority.length; i += 1) {        const element = currentAuthority[i]        if (authority.indexOf(element) >= 0) {          return target        }      }    }    return Exception  }  throw new Error("unsupported parameters")}const check = (authority, target, Exception) => {  return checkPermissions(authority, CURRENT, target, Exception)}
```

首先如果路由表中没有`authority`字段默认都可以访问。

接着分别对`authority`为字符串和数组的情况做了处理，其实就是简单的查找匹配，匹配到了就可以访问，匹配不到就返回`Exception`，也就是我们自定义的异常页面。

> 有一个点一直没有提：用户当前角色权限 `currentAuthority` 如何获取？这个是在页面初始化时从接口读取，然后存到 `store` 中

有了这块逻辑，我们对刚刚的`AuthorizedRoute`做一下改造。首先抽象一个`Authorized`组件，对权限校验逻辑做一下封装：

```
import React from "react"import CheckPermissions from "./CheckPermissions"class Authorized extends React.Component {  render() {    const { children, authority, noMatch = null } = this.props    const childrenRender = typeof children === "undefined" ? null : children    return CheckPermissions(authority, childrenRender, noMatch)  }}export default Authorized
```

接着`AuthorizedRoute`可直接使用`Authorized`组件：

```
import React from "react"import { Redirect, Route } from "react-router-dom"import Authorized from "./Authorized"class AuthorizedRoute extends React.Component {  render() {    const { component: Component, render, authority, redirectPath, ...rest } = this.props    return (      <Authorized        authority={authority}        noMatch={<Route {...rest} render={() => <Redirect to={{ pathname: redirectPath }} />} />}      >        <Route {...rest} render={props => (Component ? <Component {...props} /> : render(props))} />      </Authorized>    )  }}export default AuthorizedRoute
```

这里采用了`render props`的方式：如果提供了`component props`就用`component`渲染，否则使用`render`渲染。

5 菜单权限
------

菜单权限的处理相对就简单很多了，统一集成到`SiderMenu`组件处理：

```
export default class SiderMenu extends PureComponent {  constructor(props) {    super(props)  }  /**   * get SubMenu or Item   */  getSubMenuOrItem = item => {    if (item.children && item.children.some(child => child.name)) {      const childrenItems = this.getNavMenuItems(item.children)      // 当无子菜单时就不展示菜单      if (childrenItems && childrenItems.length > 0) {        return (          <SubMenu            title={              item.icon ? (                <span>                  {getIcon(item.icon)}                  <span>{item.name}</span>                </span>              ) : (                item.name              )            }            key={item.path}          >            {childrenItems}          </SubMenu>        )      }      return null    }    return <Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>  }  /**   * 获得菜单子节点   * @memberof SiderMenu   */  getNavMenuItems = menusData => {    if (!menusData) {      return []    }    return menusData      .filter(item => item.name && !item.hideInMenu)      .map(item => {        // make dom        const ItemDom = this.getSubMenuOrItem(item)        return this.checkPermissionItem(item.authority, ItemDom)      })      .filter(item => item)  }  /**   *   * @description 菜单权限过滤   * @param {*} authority   * @param {*} ItemDom   * @memberof SiderMenu   */  checkPermissionItem = (authority, ItemDom) => {    const { Authorized } = this.props    if (Authorized && Authorized.check) {      const { check } = Authorized      return check(authority, ItemDom)    }    return ItemDom  }  render() {    // ...    return      <Sider        trigger={null}        collapsible        collapsed={collapsed}        breakpoint="lg"        onCollapse={onCollapse}        className={siderClass}      >        <div class>            {!collapsed && <h1>冯言冯语</h1>}          </Link>        </div>        <Menu          key="Menu"          theme={theme}          mode={mode}          {...menuProps}          onOpenChange={this.handleOpenChange}          selectedKeys={selectedKeys}        >          {this.getNavMenuItems(menuData)}        </Menu>      </Sider>  }}
```

这里我只贴了一些核心代码，其中的`checkPermissionItem`就是实现菜单权限的关键。他同样用到了上文中的`check`方法来对当前菜单进行权限比对，如果没有权限就直接不展示当前菜单。

### 参考资料

[1]

基于 Vue 的后台管理系统权限控制: _https://github.com/easy-wheel/ts-vue/blob/master/src/peimission.ts_

[2]

ant-design-pro v1: _https://github.com/ant-design/ant-design-pro/tree/v1_