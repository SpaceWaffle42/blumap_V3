document.addEventListener('DOMContentLoaded', function () {
  const isMobile = window.innerWidth <= 768; //Mobile device width

  var swipeableTabs = document.querySelectorAll('.swipeable-tabs');
  M.Tabs.init(swipeableTabs, { swipeable: !isMobile });

  var Tabs = document.querySelectorAll('.tabs:not(.swipeable-tabs)');
  M.Tabs.init(Tabs, { swipeable: false });
});
