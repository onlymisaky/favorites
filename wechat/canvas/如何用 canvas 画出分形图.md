> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Lv0lcgBTohulTuf5102X8g)

前言
==

分形是一门以非规则几何形态为研究对象的几何学，由曼德勃 罗（B.B.Mandelbrot）等人创立并命名。

分形图从整体上看，是处处不规律的。但从局部观察，图形的规则性又是相同的，即具有**自相似**的性质。

通常意义下，分形被定义为将一个确定的**几何形状（元图像）**在其边上**迭代**地生成为）与元图像近似地的形状。这次想用 canvas 画出典型的几个分形图。

基础数学篇
=====

在画分形图之前我们需要首先明确 Canvas 的数学体系，才能利用好这个工具完成分型图的绘制。

众所周知，Canvas 采用的坐标系默认是以画布左上角为坐标原点，x 轴向右，y 轴向下。画布的大小决定了坐标系 x、y 轴的最大值。

假设，我们要在宽 300 * 高 300 的一个 Canvas 画布上实现一个六角形。其中，六角形的边长是 50。试想应该怎么做。

观察六角形的基本形状，找到 12 条边的规律是：相邻两条边为一组，第 1 条边画完后逆时针转 60 度，画完相同长度的第 2 条边，随后顺时针转 120 度，这样重复执行 6 次后，一个基础的六角形就画出来了。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RUdpsmUa3LfCu6fsticIVIMaphzZ2icYI5bCIt7Ticiav4dibxGEL8auwIpA/640?wx_fmt=png)

假设路径是从 P1 点画到 P2，再到 P3、P4。已知 P1、P2 的坐标，那么我们还需要找到 P3、P4 的坐标是多少。这是一个简单的根据坐标与角度找下一个坐标的数学问题，我们可以通过简单的顶点换算将其绘制出来。

旋转与坐标点映射
--------

先简单复习一下数学知识。已知 P1、P2 的坐标，P2P1 的长度为 r，将向量 P1P2 顺时针旋转 α2 角度后，计算 P3 的坐标值。![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RILj1zfkvGL8MDkJHbQ4ibjy03Y2rfKV42Kg7cgUMWNHgmVzmraEoBVA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RUZrDDxaRUqOYvgWZ5KBYFg8UAFb3CqdelVJvibCNStcibF0Z0KRDmjHQ/640?wx_fmt=png)同理可以得到逆时针旋转的计算公式。由以上推导同样可以得到旋转矩阵如下。![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RjVISln4ibiaXpWDe0n5uS1nM3Dt5LEvicOH0GJmlZLk6WdwuY0OwC9qaA/640?wx_fmt=png)

<table><thead><tr data-style="border-width: 1px 0px 0px; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">顺时针<section role="presentation" data-formula="\begin{bmatrix}cosβ&amp;sinβ\\ -sinβ&amp;cosβ\\ \end{bmatrix}" data-formula-type="block-equation"><svg xmlns="http://www.w3.org/2000/svg" role="img" focusable="false" viewBox="0 -1450 6579.7 2400" aria-hidden="true"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g data-mml-node="math"><g data-mml-node="mrow"><g data-mml-node="mo"><path data-c="5B" d="M247 -949V1450H516V1388H309V-887H516V-949H247Z"></path></g><g data-mml-node="mtable" transform="translate(528, 0)"><g data-mml-node="mtr" transform="translate(0, 700)"><g data-mml-node="mtd" transform="translate(402.5, 0)"><g data-mml-node="mi"><path data-c="63" d="M34 159Q34 268 120 355T306 442Q362 442 394 418T427 355Q427 326 408 306T360 285Q341 285 330 295T319 325T330 359T352 380T366 386H367Q367 388 361 392T340 400T306 404Q276 404 249 390Q228 381 206 359Q162 315 142 235T121 119Q121 73 147 50Q169 26 205 26H209Q321 26 394 111Q403 121 406 121Q410 121 419 112T429 98T420 83T391 55T346 25T282 0T202 -11Q127 -11 81 37T34 159Z"></path></g><g data-mml-node="mi" transform="translate(433, 0)"><path data-c="6F" d="M201 -11Q126 -11 80 38T34 156Q34 221 64 279T146 380Q222 441 301 441Q333 441 341 440Q354 437 367 433T402 417T438 387T464 338T476 268Q476 161 390 75T201 -11ZM121 120Q121 70 147 48T206 26Q250 26 289 58T351 142Q360 163 374 216T388 308Q388 352 370 375Q346 405 306 405Q243 405 195 347Q158 303 140 230T121 120Z"></path></g><g data-mml-node="mi" transform="translate(918, 0)"><path data-c="73" d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"></path></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(1387, 0)"><g data-mml-node="mo"><text data-variant="normal" transform="matrix(1 0 0 -1 0 0)" font-size="934.6px" font-family="serif">β</text></g></g></g><g data-mml-node="mtd" transform="translate(3650.9, 0)"><g data-mml-node="mi"><path data-c="73" d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"></path></g><g data-mml-node="mi" transform="translate(469, 0)"><path data-c="69" d="M184 600Q184 624 203 642T247 661Q265 661 277 649T290 619Q290 596 270 577T226 557Q211 557 198 567T184 600ZM21 287Q21 295 30 318T54 369T98 420T158 442Q197 442 223 419T250 357Q250 340 236 301T196 196T154 83Q149 61 149 51Q149 26 166 26Q175 26 185 29T208 43T235 78T260 137Q263 149 265 151T282 153Q302 153 302 143Q302 135 293 112T268 61T223 11T161 -11Q129 -11 102 10T74 74Q74 91 79 106T122 220Q160 321 166 341T173 380Q173 404 156 404H154Q124 404 99 371T61 287Q60 286 59 284T58 281T56 279T53 278T49 278T41 278H27Q21 284 21 287Z"></path></g><g data-mml-node="mi" transform="translate(814, 0)"><path data-c="6E" d="M21 287Q22 293 24 303T36 341T56 388T89 425T135 442Q171 442 195 424T225 390T231 369Q231 367 232 367L243 378Q304 442 382 442Q436 442 469 415T503 336T465 179T427 52Q427 26 444 26Q450 26 453 27Q482 32 505 65T540 145Q542 153 560 153Q580 153 580 145Q580 144 576 130Q568 101 554 73T508 17T439 -10Q392 -10 371 17T350 73Q350 92 386 193T423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 180T152 343Q153 348 153 366Q153 405 129 405Q91 405 66 305Q60 285 60 284Q58 278 41 278H27Q21 284 21 287Z"></path></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(1414, 0)"><g data-mml-node="mo"><text data-variant="normal" transform="matrix(1 0 0 -1 0 0)" font-size="934.6px" font-family="serif">β</text></g></g></g></g><g data-mml-node="mtr" transform="translate(0, -700)"><g data-mml-node="mtd"><g data-mml-node="mo"><path data-c="2212" d="M84 237T84 250T98 270H679Q694 262 694 250T679 230H98Q84 237 84 250Z"></path></g><g data-mml-node="mi" transform="translate(778, 0)"><path data-c="73" d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"></path></g><g data-mml-node="mi" transform="translate(1247, 0)"><path data-c="69" d="M184 600Q184 624 203 642T247 661Q265 661 277 649T290 619Q290 596 270 577T226 557Q211 557 198 567T184 600ZM21 287Q21 295 30 318T54 369T98 420T158 442Q197 442 223 419T250 357Q250 340 236 301T196 196T154 83Q149 61 149 51Q149 26 166 26Q175 26 185 29T208 43T235 78T260 137Q263 149 265 151T282 153Q302 153 302 143Q302 135 293 112T268 61T223 11T161 -11Q129 -11 102 10T74 74Q74 91 79 106T122 220Q160 321 166 341T173 380Q173 404 156 404H154Q124 404 99 371T61 287Q60 286 59 284T58 281T56 279T53 278T49 278T41 278H27Q21 284 21 287Z"></path></g><g data-mml-node="mi" transform="translate(1592, 0)"><path data-c="6E" d="M21 287Q22 293 24 303T36 341T56 388T89 425T135 442Q171 442 195 424T225 390T231 369Q231 367 232 367L243 378Q304 442 382 442Q436 442 469 415T503 336T465 179T427 52Q427 26 444 26Q450 26 453 27Q482 32 505 65T540 145Q542 153 560 153Q580 153 580 145Q580 144 576 130Q568 101 554 73T508 17T439 -10Q392 -10 371 17T350 73Q350 92 386 193T423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 180T152 343Q153 348 153 366Q153 405 129 405Q91 405 66 305Q60 285 60 284Q58 278 41 278H27Q21 284 21 287Z"></path></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(2192, 0)"><g data-mml-node="mo"><text data-variant="normal" transform="matrix(1 0 0 -1 0 0)" font-size="934.6px" font-family="serif">β</text></g></g></g><g data-mml-node="mtd" transform="translate(3664.4, 0)"><g data-mml-node="mi"><path data-c="63" d="M34 159Q34 268 120 355T306 442Q362 442 394 418T427 355Q427 326 408 306T360 285Q341 285 330 295T319 325T330 359T352 380T366 386H367Q367 388 361 392T340 400T306 404Q276 404 249 390Q228 381 206 359Q162 315 142 235T121 119Q121 73 147 50Q169 26 205 26H209Q321 26 394 111Q403 121 406 121Q410 121 419 112T429 98T420 83T391 55T346 25T282 0T202 -11Q127 -11 81 37T34 159Z"></path></g><g data-mml-node="mi" transform="translate(433, 0)"><path data-c="6F" d="M201 -11Q126 -11 80 38T34 156Q34 221 64 279T146 380Q222 441 301 441Q333 441 341 440Q354 437 367 433T402 417T438 387T464 338T476 268Q476 161 390 75T201 -11ZM121 120Q121 70 147 48T206 26Q250 26 289 58T351 142Q360 163 374 216T388 308Q388 352 370 375Q346 405 306 405Q243 405 195 347Q158 303 140 230T121 120Z"></path></g><g data-mml-node="mi" transform="translate(918, 0)"><path data-c="73" d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"></path></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(1387, 0)"><g data-mml-node="mo"><text data-variant="normal" transform="matrix(1 0 0 -1 0 0)" font-size="934.6px" font-family="serif">β</text></g></g></g></g></g><g data-mml-node="mo" transform="translate(6051.7, 0)"><path data-c="5D" d="M11 1388V1450H280V-949H11V-887H218V1388H11Z"></path></g></g></g></g></svg></section>[cosβ−sinβsinβcosβ]</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">逆时针<section role="presentation" data-formula="\begin{bmatrix}cosβ&amp;-sinβ\\ sinβ&amp;cosβ\\ \end{bmatrix}" data-formula-type="block-equation"><svg xmlns="http://www.w3.org/2000/svg" role="img" focusable="false" viewBox="0 -1450 6579.7 2400" aria-hidden="true"><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g data-mml-node="math"><g data-mml-node="mrow"><g data-mml-node="mo"><path data-c="5B" d="M247 -949V1450H516V1388H309V-887H516V-949H247Z"></path></g><g data-mml-node="mtable" transform="translate(528, 0)"><g data-mml-node="mtr" transform="translate(0, 700)"><g data-mml-node="mtd" transform="translate(13.5, 0)"><g data-mml-node="mi"><path data-c="63" d="M34 159Q34 268 120 355T306 442Q362 442 394 418T427 355Q427 326 408 306T360 285Q341 285 330 295T319 325T330 359T352 380T366 386H367Q367 388 361 392T340 400T306 404Q276 404 249 390Q228 381 206 359Q162 315 142 235T121 119Q121 73 147 50Q169 26 205 26H209Q321 26 394 111Q403 121 406 121Q410 121 419 112T429 98T420 83T391 55T346 25T282 0T202 -11Q127 -11 81 37T34 159Z"></path></g><g data-mml-node="mi" transform="translate(433, 0)"><path data-c="6F" d="M201 -11Q126 -11 80 38T34 156Q34 221 64 279T146 380Q222 441 301 441Q333 441 341 440Q354 437 367 433T402 417T438 387T464 338T476 268Q476 161 390 75T201 -11ZM121 120Q121 70 147 48T206 26Q250 26 289 58T351 142Q360 163 374 216T388 308Q388 352 370 375Q346 405 306 405Q243 405 195 347Q158 303 140 230T121 120Z"></path></g><g data-mml-node="mi" transform="translate(918, 0)"><path data-c="73" d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"></path></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(1387, 0)"><g data-mml-node="mo"><text data-variant="normal" transform="matrix(1 0 0 -1 0 0)" font-size="934.6px" font-family="serif">β</text></g></g></g><g data-mml-node="mtd" transform="translate(2872.9, 0)"><g data-mml-node="mo"><path data-c="2212" d="M84 237T84 250T98 270H679Q694 262 694 250T679 230H98Q84 237 84 250Z"></path></g><g data-mml-node="mi" transform="translate(778, 0)"><path data-c="73" d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"></path></g><g data-mml-node="mi" transform="translate(1247, 0)"><path data-c="69" d="M184 600Q184 624 203 642T247 661Q265 661 277 649T290 619Q290 596 270 577T226 557Q211 557 198 567T184 600ZM21 287Q21 295 30 318T54 369T98 420T158 442Q197 442 223 419T250 357Q250 340 236 301T196 196T154 83Q149 61 149 51Q149 26 166 26Q175 26 185 29T208 43T235 78T260 137Q263 149 265 151T282 153Q302 153 302 143Q302 135 293 112T268 61T223 11T161 -11Q129 -11 102 10T74 74Q74 91 79 106T122 220Q160 321 166 341T173 380Q173 404 156 404H154Q124 404 99 371T61 287Q60 286 59 284T58 281T56 279T53 278T49 278T41 278H27Q21 284 21 287Z"></path></g><g data-mml-node="mi" transform="translate(1592, 0)"><path data-c="6E" d="M21 287Q22 293 24 303T36 341T56 388T89 425T135 442Q171 442 195 424T225 390T231 369Q231 367 232 367L243 378Q304 442 382 442Q436 442 469 415T503 336T465 179T427 52Q427 26 444 26Q450 26 453 27Q482 32 505 65T540 145Q542 153 560 153Q580 153 580 145Q580 144 576 130Q568 101 554 73T508 17T439 -10Q392 -10 371 17T350 73Q350 92 386 193T423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 180T152 343Q153 348 153 366Q153 405 129 405Q91 405 66 305Q60 285 60 284Q58 278 41 278H27Q21 284 21 287Z"></path></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(2192, 0)"><g data-mml-node="mo"><text data-variant="normal" transform="matrix(1 0 0 -1 0 0)" font-size="934.6px" font-family="serif">β</text></g></g></g></g><g data-mml-node="mtr" transform="translate(0, -700)"><g data-mml-node="mtd"><g data-mml-node="mi"><path data-c="73" d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"></path></g><g data-mml-node="mi" transform="translate(469, 0)"><path data-c="69" d="M184 600Q184 624 203 642T247 661Q265 661 277 649T290 619Q290 596 270 577T226 557Q211 557 198 567T184 600ZM21 287Q21 295 30 318T54 369T98 420T158 442Q197 442 223 419T250 357Q250 340 236 301T196 196T154 83Q149 61 149 51Q149 26 166 26Q175 26 185 29T208 43T235 78T260 137Q263 149 265 151T282 153Q302 153 302 143Q302 135 293 112T268 61T223 11T161 -11Q129 -11 102 10T74 74Q74 91 79 106T122 220Q160 321 166 341T173 380Q173 404 156 404H154Q124 404 99 371T61 287Q60 286 59 284T58 281T56 279T53 278T49 278T41 278H27Q21 284 21 287Z"></path></g><g data-mml-node="mi" transform="translate(814, 0)"><path data-c="6E" d="M21 287Q22 293 24 303T36 341T56 388T89 425T135 442Q171 442 195 424T225 390T231 369Q231 367 232 367L243 378Q304 442 382 442Q436 442 469 415T503 336T465 179T427 52Q427 26 444 26Q450 26 453 27Q482 32 505 65T540 145Q542 153 560 153Q580 153 580 145Q580 144 576 130Q568 101 554 73T508 17T439 -10Q392 -10 371 17T350 73Q350 92 386 193T423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 180T152 343Q153 348 153 366Q153 405 129 405Q91 405 66 305Q60 285 60 284Q58 278 41 278H27Q21 284 21 287Z"></path></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(1414, 0)"><g data-mml-node="mo"><text data-variant="normal" transform="matrix(1 0 0 -1 0 0)" font-size="934.6px" font-family="serif">β</text></g></g></g><g data-mml-node="mtd" transform="translate(3275.4, 0)"><g data-mml-node="mi"><path data-c="63" d="M34 159Q34 268 120 355T306 442Q362 442 394 418T427 355Q427 326 408 306T360 285Q341 285 330 295T319 325T330 359T352 380T366 386H367Q367 388 361 392T340 400T306 404Q276 404 249 390Q228 381 206 359Q162 315 142 235T121 119Q121 73 147 50Q169 26 205 26H209Q321 26 394 111Q403 121 406 121Q410 121 419 112T429 98T420 83T391 55T346 25T282 0T202 -11Q127 -11 81 37T34 159Z"></path></g><g data-mml-node="mi" transform="translate(433, 0)"><path data-c="6F" d="M201 -11Q126 -11 80 38T34 156Q34 221 64 279T146 380Q222 441 301 441Q333 441 341 440Q354 437 367 433T402 417T438 387T464 338T476 268Q476 161 390 75T201 -11ZM121 120Q121 70 147 48T206 26Q250 26 289 58T351 142Q360 163 374 216T388 308Q388 352 370 375Q346 405 306 405Q243 405 195 347Q158 303 140 230T121 120Z"></path></g><g data-mml-node="mi" transform="translate(918, 0)"><path data-c="73" d="M131 289Q131 321 147 354T203 415T300 442Q362 442 390 415T419 355Q419 323 402 308T364 292Q351 292 340 300T328 326Q328 342 337 354T354 372T367 378Q368 378 368 379Q368 382 361 388T336 399T297 405Q249 405 227 379T204 326Q204 301 223 291T278 274T330 259Q396 230 396 163Q396 135 385 107T352 51T289 7T195 -10Q118 -10 86 19T53 87Q53 126 74 143T118 160Q133 160 146 151T160 120Q160 94 142 76T111 58Q109 57 108 57T107 55Q108 52 115 47T146 34T201 27Q237 27 263 38T301 66T318 97T323 122Q323 150 302 164T254 181T195 196T148 231Q131 256 131 289Z"></path></g><g data-mml-node="TeXAtom" data-mjx-texclass="ORD" transform="translate(1387, 0)"><g data-mml-node="mo"><text data-variant="normal" transform="matrix(1 0 0 -1 0 0)" font-size="934.6px" font-family="serif">β</text></g></g></g></g></g><g data-mml-node="mo" transform="translate(6051.7, 0)"><path data-c="5D" d="M11 1388V1450H280V-949H11V-887H218V1388H11Z"></path></g></g></g></g></svg></section>[cosβsinβ−sinβcosβ]</th></tr></thead></table>

### 代码实现

1.  ```
    绘制六角形。首先从第一个点P1\(0,50\)、P2\(50,50\)开始画，核心模块放入hexagon方法中，迭代6次。
    ```
    

```
var ctx = canvas.getContext("2d");
      ctx.strikeStyle = "#000";
      ctx.beginPath();
      const y = 50;
      ctx.moveTo(0, y);
      hexagon(ctx, 0, y, 50, y, 0, 6);
```

2.  hexagon 方法的输入参数有 (ctx, x1, y1, x2, y2, n, m)。
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3ROoHOXOibW7WGPxclT7047iaf1rib8mR96J8ctA60UXUjbtg0qVV2WxRMQ/640?wx_fmt=png)

```
function hexagon(ctx, x1, y1, x2, y2, n, m) {    ctx.clearRect(0, 0, 300, 300);    // 顺时针 60度    ctx.moveTo(x2, y2);    const x3 = x2 +      (x2 - x1) * Math.cos(Math.PI / 3) +      (y2 - y1) * Math.sin(Math.PI / 3);    const y3 = y2 -      (x2 - x1) * Math.sin(Math.PI / 3) +      (y2 - y1) * Math.cos(Math.PI / 3);    ctx.lineTo(x3, y3);    // 逆时针 120度    const x4 = x3 +      (x3 - x2) * Math.cos((Math.PI * 2) / 3) -      (y3 - y2) * Math.sin((Math.PI * 2) / 3);    const y4 = y3 +      (y3 - y2) * Math.cos((Math.PI * 2) / 3) +      (x3 - x2) * Math.sin((Math.PI * 2) / 3);    ctx.lineTo(x4, y4);    ctx.stroke();    n++;    if (n === m) {      return false;    } else {      hexagon(ctx, x3, y3, x4, y4, n, m);    }  }
```

向量运算
----

从以上流程可以看出，通过坐标进行点的绘制是非常麻烦并且费时间的，加上 Canvas 2D 的坐标与常规数据坐标系上下颠倒，我们会花费大量时间在坐标点的计算上。

因此，为了代码的逻辑简单、易读，我们可以转变思路，将坐标点以向量的方式来理解。复习一下常用的向量运算有以下几种。

**向量相加 / 减**。**向量点乘、叉乘**。如图 1 所示，向量相加的含义是，路径沿 v1、v2 进行绘画，则 P2 坐标点为 v1 与 v2 两个向量相加，为 [x1+x2, y1+y2]。点乘为 a、b 向量点积的几何含义，是 a 向量乘以 b 向量在 a 向量上的投影分量，如图 2 所示。叉乘为两向量组成的面积，如图 3 所示。![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3R7fQasrsh8s6icic6Fe7LZ36T587ORNagqGqoLq4yaCDF7EsEwGuv2ibZQ/640?wx_fmt=png)

### 代码实现

用形如 [x,y] 的数组方式描述向量。

```
class Vector extends Array {  constructor(x = 1, y = 0) {    super(x, y);  }  copy() {    return new Vector(this.x, this.y);  } }
```

向量相加减。

```
add(v) {    this.x += v.x;    this.y += v.y;    return this;  }  sub(v) {    this.x -= v.x;    this.y -= v.y;    return this;  }
```

向量叉乘点乘。

```
cross(v) {    return this.x * v.y - v.x * this.y;  }  dot(v) {    return this.x * v.x + v.y * this.y;  }
```

向量旋转。

```
rotate(rad) {    const c = Math.cos(rad),      s = Math.sin(rad);    const [x, y] = this;    this.x = x * c + y * -s;    this.y = x * s + y * c;    return this;  }
```

按照向量运算，画出一个六角雪花的代码可以改写成以下方式。首先将 canvas 坐标系进行上下翻转，形成我们习惯的坐标方式。

```
var ctx = canvas.getContext("2d");

 ctx.translate(0, canvas.height);

 ctx.scale(1, -1);
```

得到 v0、v1 的向量，进行逆时针和顺时针的旋转，得到的效果与之前的方式一致，但代码的可读性却增加了很多。

```
const v0 = new Vector(0, 250);const v1 = new Vector(50, 250);hexagon(ctx, v0, v1, 0, 6);function hexagon(ctx, v0, v1, n, m) {    const v2 = v1.copy().sub(v0);    v2.rotate((60 * Math.PI) / 180).add(v1); // 逆时针 60度    const v3 = v2.copy().sub(v1);    v3.rotate((-120 * Math.PI) / 180).add(v2); // 顺时针 120度    ctx.beginPath();    ctx.moveTo(...v1);    ctx.lineTo(...v2);    ctx.lineTo(...v3);    ctx.stroke();    n++;    if (n === m) {      return false;    } else {      hexagon(ctx, v2, v3, n, m);    }}
```

实践篇
===

分形图的逻辑规律是递归与基础图形的结合，在实践篇中我们选择几个典型分形图进行实现。

科赫雪花
----

科赫雪花最早由数学家 Helge von Koch 提出，是分形几何中经典图像之一。它的生成基于科赫曲线，即单边的无限分形。

先看一下实现效果，它的基础图形是**等边三角形**。该图片的面积有限，但周长是无限的。每次迭代，线段的长度都会增加原长度的三分之一。

<table><thead><tr data-style="border-width: 1px 0px 0px; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RVO3W9W7aBDaABrR0v9KiaXUJcaEMRSpfDXibbQAH4YzL4KicicIxfoNrQQ/640?wx_fmt=gif"></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RfZT4rsDYIH3R4vwibWUvIwzBNutFib8afCicYFHc5QvKV09KI4TWecUibQ/640?wx_fmt=png"></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RembyQVfIOzUsy8rmAwA0qSibghkA2XAp0nndhMS8UyHxKrjSodkzLMA/640?wx_fmt=png"></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RMbELr5rSPtdGoXbUWM2iaFJTSSDLDDYRiaZia3Ij69gro43FvSBthTwiaw/640?wx_fmt=png"></th></tr></thead></table>

### 思路

1.  科赫雪花由科赫曲线组成，它最基本的形状是一个三角形，将三角形的每条边等分成 3 份，中间那份线段先右转 60 度之后画出边长一样的线段后，再向左旋转 120 度画出等长。
    
2.  在递归的模块里递归执行步骤 1，直到达到设置的递归层级。
    

<table><thead><tr data-style="border-width: 1px 0px 0px; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RiaUX6h5EzQAVqMOIibamUW6p4u6jJKxyzibibsn4ibeJEK0a5ony0G4QXvg/640?wx_fmt=png">图 4</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RsFsQM9Uceaiaa5TTSpbLlXPJtsgl0obLD6N3HWv3GTiaTeL14cp6oJIw/640?wx_fmt=png"> 图 5</th></tr></thead></table>

### 代码实现

首先还是坐标变换，将坐标原点从左上角移动到左下角，并且让 y 轴翻转为向上。

```
var ctx = canvas.getContext("2d");

      ctx.translate(0, canvas.height);

      ctx.scale(1, -1);
```

然后我们找到三角形的三个顶点，假设我们从 v1(100,100) 出发，三角形边长为 100，则通过向量变换可以获取其余两个顶点 v2、v3 向量。

```
var ctx = canvas.getContext("2d");

      const v1 = new Vector(100, 100);

      const v2 = new Vector(100, 0).add(v1);

      const v3 = new Vector(100, 0).rotate((60 * Math.PI) / 180).add(v1);
```

接着我们根据对三条边，也就是 v1v2、v2v3、v3v2 三向量分别进行递归操作。

```
koch(ctx, v1, v2, 0, deep);

      koch(ctx, v2, v3, 0, deep);

      koch(ctx, v3, v1, 0, deep);
```

我们定义一个递归的核心模块：`function koch(ctx, v1, v2, n, m) {}`

该函数有五个参数：ctx 是 Canvas2D 上下文。v1 是一条边的起始向量，v2 是终止向量，n 为当前迭代层级，m 为总共迭代次数。在模块中我们根据图 5 中描述，将一条边划分成四段，每段长度相同。得到 v3、v4、v5。终止条件为迭代层级与规定好的次数相同，这时将 v1~v5 的折线路径连接起来。这样就形成了一个科赫雪花。代码如下。

```
function koch(ctx, v1, v2, n, m) {

    ctx.clearRect(0, 0, 300, 300); //每次绘图前清除画板

    const oneThirdVector = v2
      .copy()
      .sub(v1)
      .scale(1 / 3);

    const v3 = oneThirdVector.copy().add(v1);

    const v4 = oneThirdVector.copy().scale(2).add(v1);

    const v5 = v4
      .copy()
      .sub(v3)
      .rotate((-60 * Math.PI) / 180)
      .add(v3);

    n++;

    if (n === m) {

      //绘图（连线） 当前层级与设定层级一致时候停止递归

      ctx.moveTo(...v1);

      ctx.lineTo(...v3);

      ctx.lineTo(...v5);

      ctx.lineTo(...v4);

      ctx.lineTo(...v2);

      ctx.stroke();

      return false;

    }

    //递归调用绘图

    koch(ctx, v1, v3, n, m);

    koch(ctx, v3, v5, n, m);

    koch(ctx, v5, v4, n, m);

    koch(ctx, v4, v2, n, m);

  }
```

六角形雪花
-----

先看一下实现效果，它的基础图形是六角形。每迭代一次，都以每条线段的 1/3 作为边长，在每个角顶点处再画出下一个小六角形。重复这个步骤便可以得到一个六角形雪花分型图。

<table><thead><tr data-style="border-width: 1px 0px 0px; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3REAjPvcP84jz1QvhtA6YMFHC8JhpPIuImRfnndAxsaZfVAVFBDGzOcg/640?wx_fmt=gif"></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RiaTCfxogRL6lLbzyib3b6lpkKBHIGR95yASNYibbibPibAFJ0c1NKEKjTkA/640?wx_fmt=png"></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RIMZMH3wpGAGvB3ksqHIf4ibAKjg1VRABUxUE1H839lPUxxGaTJDcogQ/640?wx_fmt=png"></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RRGeeIFLq1Lhmy1mYunOGFALSaRGv5JxBXzNIB58hZQYZq1X1xWnXTA/640?wx_fmt=png"></th></tr></thead></table>

### 思路

1.  首先根据基础篇中提到的六角形雪花的生成规律，每相邻两条边为一组，第 1 条边左转 60 度，第 2 条边右转 120 度，执行 6 次即可得到基础形状六角形。
    
2.  在开始画线之前判断该次的边长是否小于规定的最小边长。如果不小于则将边长变为原变成的 1/3，进行递归调用，若小于则开始绘制六角形。
    

### 代码实现

坐标变化和获取 canvas 2D 的上下文这里就不再累述。首先，我们从 v0、v1 出发进行画六边形的主函数中。

```
const v0 = new Vector(50, 200);

const v1 = new Vector(100, 200);

hexagon(ctx, v0, v1);
```

我们定义一个递归的核心模块：`function hexagon(ctx, v0, v1) {}`

该函数有五个参数：ctx 是 Canvas2D 上下文。v0v1 是开始作画的起始向量，也就是给我们的作画一个开始的方向。hexagon 中，我们计算出本次迭代的六角形边长`hexagonLen`，当不满足终止条件时候进行迭代。

```
function hexagon(ctx, v0, v1) {    const hexagonLen = v1.copy().sub(v0).vlength;    if (hexagonLen > minLine) {    // 进入迭代    }  }
```

这里我们将六角形分为 6 次循环。每次循环都是从 vstart 到 vmiddle，再到 vend。![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RgxuYlD8OM2oAs1GDkUicrv8ZN2y7O0xRA7Y2GIMBp3MEgdMXricpNxBA/640?wx_fmt=png)

```
// 迭代中 hexagon(ctx, v0, v1)let vstart = v1.copy();let vmiddle = v1.copy().sub(v0);let vend = new Vector();for (let i = 0; i < 6; i++) {// 六角形的6次循环}
```

在循环体中，我们先获取该次迭代中 vstart、vmiddle、vend 的向量，以及下一次的边长。如果新的边长大于设置的最小边长`minLine`，则进行下一次的迭代，否则，便沿着这三个向量进行绘制。绘制完后，更新 vstart、vmiddle。

```
// 向量旋转  vmiddle.rotate((60 * Math.PI) / 180).add(vstart);  vend = vmiddle.copy().sub(vstart);  vend.rotate((-120 * Math.PI) / 180).add(vmiddle);  const thirdv = vend          .copy()          .sub(vmiddle)          .scale(1 / 3)          .add(vmiddle);  const newHexagonLen = thirdv.copy().sub(vmiddle).vlength;  if (newHexagonLen > minLine) {  // 递归      hexagon(ctx, vmiddle, thirdv);  } else {  // 绘图      ctx.beginPath();      ctx.moveTo(...vstart);      ctx.lineTo(...vmiddle);      ctx.lineTo(...vend);     ctx.stroke();  }  vstart = vend.copy();  vmiddle = vend.copy().sub(vmiddle);
```

这样，我们就实现了绘制六角雪花的方法。

二叉树
---

实现一颗二叉树要比前面的科赫雪花和六角形雪花简单的多。

### 思路

1.  首先我们只需要知道初始状态时的起点以及树干的长度。
    
2.  在递归模块中，我们将树枝长度与宽度都削减为上一级树枝的 1/2。并且进行固定角度的左右偏移。终止条件为树枝的长度小于规定好的最小长度。这样就可以画出一颗二叉树了。
    

<table><thead><tr data-style="border-width: 1px 0px 0px; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RKNhE1FJNUibxoia0jvmAlNacKQb9xmWLn0rYRQqrQIecT80evPFEvKjg/640?wx_fmt=png"></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3R9IBcPLe4iaKBiaHVbN39jBhkaObBB0qRg7pgST0ibT4N8dEttEL94hkXA/640?wx_fmt=png"></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicFk5OLOuAC6dFA4hiaX1R3RAyf5BllOTfe9rCqWC9UkAPZfjHTF9Bu0zEbIQL9GQo5hpVCGphhOWg/640?wx_fmt=png"></th></tr></thead></table>

### 代码实现

这里就不讲解代码了，有兴趣的同学可以点击这里进行代码访问。

总结
==

在绘制分形图的过程中，我们复习了以下几个知识点，首先，在 Canvas 中我们可以通过坐标系变换来满足实际需求，对坐标进行合理的变化可以让我们的绘图逻辑变得简单易懂。其次，向量在可视化中是非常方便且基础的工具，掌握和学会用向量的思维计算是学习可视化的必经之路。最后，分形图大多数都是元图像加迭代的方式，练习分形图的绘制也有助于我们掌握各式各样的递归操作，以及总结出此类图形的逻辑方法。

参考文献
====

1.  canvas 生成科赫雪花（曲线）
    
2.  GitHub - akira-cn/graphics: 一些图形系统相关的小例子
    
3.  二维旋转矩阵与向量旋转
    
4.  代码：canvas fenxing - CodeSandbox
    
    参考资料
    ====
    
    [1]
    
    这里: _https://codesandbox.io/s/canvas-tree-hhjoh?file=/src/components/Tree.jsx_
    
    [2]
    
    canvas 生成科赫雪花（曲线）: _https://garychang.cn/2017/01/06/koch/_
    
    [3]
    
    GitHub - akira-cn/graphics: 一些图形系统相关的小例子: _https://github.com/akira-cn/graphics_
    
    [4]
    
    二维旋转矩阵与向量旋转: _https://zhuanlan.zhihu.com/p/98007510_
    
    [5]
    
    canvas fenxing - CodeSandbox: _https://codesandbox.io/s/canvas-fenxing-hhjoh_
    

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73ziclRKVibg9iaiaenCe5vrVX9MXptkUppOlzUGxZv8wbBp1NxwFTHwA9968FQRvJ708gP6ZkAKNPG3SgQ/640?wx_fmt=gif)