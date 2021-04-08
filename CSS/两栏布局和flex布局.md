##
浮动 + margin-left
绝对定位 + margin-left
table  table-cell不变化
calc()函数 都浮动或者变成inline-block + calc(100% - 左定宽)
弹性布局 左flex 0 1 200px  右flex 1

flex布局
子元素flex属性  grow shrink basis
grow：占剩余空间比例 默认0
shrink：缩小比例
basis：宽度
order：排序  越小越前
align-self属性：允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch