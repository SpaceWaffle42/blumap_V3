document.addEventListener('DOMContentLoaded', function () {
  var swipeableTabs = document.querySelectorAll('.swipeable-tabs');
  M.Tabs.init(swipeableTabs, { swipeable: true });

  var Tabs = document.querySelectorAll('.tabs:not(.swipeable-tabs)');
  M.Tabs.init(Tabs, { swipeable: false });
});
