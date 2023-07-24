void async function LinkResolver() {


  const hostProxy = window.location.host;
  const hostList = JSON.parse(atob(document.currentScript.getAttribute('host-list')));
  const hostList_length = hostList.length;
  let hostListQuery = 'hostListQuery';

  setInterval(async function() {
    hostListQuery = 'hostListQuery';
    for (let i = 0; i < hostList_length; i++) {
      hostListQuery = hostListQuery + ',' + `[href*="/` + hostList[i] + `"]`;
      hostListQuery = hostListQuery + ',' + `[href*="/www.` + hostList[i] + `"]`;
    }
    const href_list = document.querySelectorAll(hostListQuery);
    const href_list_length = href_list.length;

    for (let i = 0; i < hostList_length; i++) {
      for (let x = 0; x < href_list_length; x++) {
        try {
          href_list[x].href = href_list[x].href.replaceAll(hostList[i], hostProxy);
        } catch (e) { continue; }
      }
    }

    hostListQuery = 'hostListQuery';
    for (let i = 0; i < hostList_length; i++) {
      hostListQuery = hostListQuery + ',' + `[src*="/` + hostList[i] + `"]`;
      hostListQuery = hostListQuery + ',' + `[src*="/www.` + hostList[i] + `"]`;
    }
    const src_list = document.querySelectorAll(hostListQuery);
    const src_list_length = src_list.length;

    for (let i = 0; i < hostList_length; i++) {
      for (let x = 0; x < src_list_length; x++) {
        try {
          src_list[x].src = src_list[x].src.replaceAll(hostList[i], hostProxy);
        } catch (e) { continue; }
      }
    }



    hostListQuery = 'hostListQuery';
    for (let i = 0; i < hostList_length; i++) {
      hostListQuery = hostListQuery + ',' + `[data-src*="/` + hostList[i] + `"]`;
      hostListQuery = hostListQuery + ',' + `[data-src*="/www.` + hostList[i] + `"]`;
    }
    const data_src_list = document.querySelectorAll(hostListQuery);
    const data_src_list_length = data_src_list.length;

    for (let i = 0; i < hostList_length; i++) {
      for (let x = 0; x < data_src_list_length; x++) {
        try {
          data_src_list[x].setAttribute('data-src', data_src_list[x].getAttribute('data-src').replaceAll(hostList[i], hostProxy));
        } catch (e) { continue; }
      }
    }


    hostListQuery = 'hostListQuery';
    for (let i = 0; i < hostList_length; i++) {
      hostListQuery = hostListQuery + ',' + `[style*="/` + hostList[i] + `"]`;
      hostListQuery = hostListQuery + ',' + `[style*="/www.` + hostList[i] + `"]`;
    }
    const style_list = document.querySelectorAll(hostListQuery);
    const style_list_length = style_list.length;

    for (let i = 0; i < hostList_length; i++) {
      for (let x = 0; x < style_list_length; x++) {
        try {
          style_list[x].setAttribute('style', style_list[x].getAttribute('style').replaceAll('/' + hostList[i], '/' + hostProxy));

        } catch (e) { continue; }
      }
    }

  }, 100);



  (async function fixMainCss() {
    let mainLink = document.querySelector('link[rel="stylesheet"][href*="load.php"]');
    if (!mainLink) { return setTimeout(async function() { fixMainCss(); }, 200); }
    let mainCss = await (await nativeFetch(mainLink.href)).text();
    let mainStyle = document.createElement('style');
    mainStyle.innerHTML = mainCss;
    document.head.appendChild(mainStyle);
  })?.();


}?.();