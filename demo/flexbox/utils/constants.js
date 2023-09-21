export const attrTypeMap = {
  number: 0,
  string: 1,
  enum: 2,
}

export const basicAttrsMap = {

}

export const containerAttrsMap = {
  'flex-direction': {
    desc: '定义主轴的方向（即项目的排列方向）。',
    type: [attrTypeMap.enum],
    defaultValue: 'row',
    enums: ['row', 'row-reverse', 'column', 'column-reverse']
  },
  'flex-wrap': {
    desc: '如果一条轴线排不下，如何换行。',
    type: [attrTypeMap.enum],
    defaultValue: 'nowrap',
    enums: ['nowrap', 'wrap', 'wrap-reverse']
  },
  'justify-content': {
    desc: '定义项目在主轴上的对齐方式。',
    type: [attrTypeMap.enum],
    defaultValue: 'flex-start',
    enums: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']
  },
  'align-items': {
    desc: '定义项目在交叉轴上的对齐方式。',
    type: [attrTypeMap.enum],
    defaultValue: 'flex-start',
    enums: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch']
  },
  'align-content': {
    desc: '定义多根轴线的对齐方式。<br />如果项目只有一根轴线，该属性不起作用',
    type: [attrTypeMap.enum],
    defaultValue: 'flex-start',
    enums: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'stretch']
  }
}

export const itemAttrsMap = {
  order: {
    desc: '项目的排列顺序，数值越小，排列越靠前，默认为0。',
    type: [attrTypeMap.number],
    defaultValue: 0,
  },
  'flex-grow': {
    desc: '项目的放大比例，默认为0，即如果存在剩余空间，也不放大。<br />如果所有项目的flex-grow属性都为1，则它们将等分剩余空间（如果有的话）。<br />如果一个项目的flex-grow属性为2，其他项目都为1，则前者占据的剩余空间将比其他项多一倍。',
    type: [attrTypeMap.number],
    defaultValue: 0,
  },
  'flex-shrink': {
    desc: '项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。<br />如果所有项目的flex-shrink属性都为1，当空间不足时，都将等比例缩小。<br />如果一个项目的flex-shrink属性为0，其他项目都为1，则空间不足时，前者不缩小。<br />负值对该属性无效。',
    type: [attrTypeMap.number],
    defaultValue: 1,
  },
  'flex-basis': {
    desc: '在分配多余空间之前，项目占据的主轴空间（main size）。<br />浏览器根据这个属性，计算主轴是否有多余空间。<br />它的默认值为auto，即项目的本来大小。<br />它可以设为跟width或height属性一样的值（比如350px），则项目将占据固定空间。',
    type: [attrTypeMap.string],
    defaultValue: 'auto',
  },
  'align-self': {
    desc: '单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。<br />默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。',
    type: [attrTypeMap.enum],
    defaultValue: 'auto ',
    enums: ['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch']
  }
}
