// 新增邊框時，只需在下方陣列加入一筆符合 AGENTS.md 格式的物件。
// layout: classic | polaroid | airmail | film | stamp | vintage | scrapbook | minimal
// motif: dots | hearts | flowers | waves | leaves | stars | confetti | none
window.POSTCARD_FRAMES = [
  {id:'classic', name:'經典奶油白', layout:'classic', motif:'none', paper:'#fffaf2', accent:'#b67a75', secondary:'#ead9c8'},
  {id:'blush', name:'莓果粉邊', layout:'classic', motif:'hearts', paper:'#fff2f3', accent:'#cb728a', secondary:'#f5bccb'},
  {id:'polaroid', name:'拍立得日記', layout:'polaroid', motif:'none', paper:'#fffefb', accent:'#8d7771', secondary:'#dfcfbe'},
  {id:'airmail', name:'航空郵件', layout:'airmail', motif:'none', paper:'#fffefa', accent:'#bd5760', secondary:'#6989bb'},
  {id:'vintage', name:'復古郵局', layout:'vintage', motif:'dots', paper:'#f4e6cb', accent:'#916342', secondary:'#c9a679'},
  {id:'ocean', name:'海岸日光', layout:'classic', motif:'waves', paper:'#f0faff', accent:'#5a91b2', secondary:'#a4d2e7'},
  {id:'film', name:'底片旅行', layout:'film', motif:'none', paper:'#252b32', accent:'#e7dfd0', secondary:'#6a7580'},
  {id:'stamp', name:'郵票紀念冊', layout:'stamp', motif:'none', paper:'#fcf4e9', accent:'#b26c62', secondary:'#ecd2b8'},
  {id:'washi', name:'紙膠帶手帳', layout:'scrapbook', motif:'flowers', paper:'#fff9f3', accent:'#b87586', secondary:'#f3d9ca'},
  {id:'minimal', name:'極簡黑白', layout:'minimal', motif:'none', paper:'#ffffff', accent:'#2f3033', secondary:'#d6d6d6'},
  {id:'botanical', name:'森林植物系', layout:'scrapbook', motif:'leaves', paper:'#f6f8ed', accent:'#6d9476', secondary:'#c0d8b9'},
  {id:'starlight', name:'夜空小旅行', layout:'minimal', motif:'stars', paper:'#f5f1ff', accent:'#7667a5', secondary:'#c9bce8'}
];
