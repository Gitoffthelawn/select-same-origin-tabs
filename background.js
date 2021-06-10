//const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?
const manifest = browser.runtime.getManifest();
const extname = manifest.name;
const extdesc = manifest.description


browser.menus.onShown.addListener( async (info,tab) => {
	if(tab.active) {
		browser.menus.create({
			id: extname,
			title: extdesc,
			contexts: ["tab"],
			onclick: async function(info, tab) {
				if(info.menuItemId.startsWith(extname)){
					const url = new URL(tab.url);
					const tabs = await browser.tabs.query({ 
						url: url.origin + "/*", 
						hidden: false
					});

					let tmp = {};

					tmp[tab.windowId] = [tab.index];

					tabs.forEach( (t) => {
						if (typeof tmp[t.windowId] === 'undefined'){
							tmp[t.windowId] = [];
						} 
						tmp[t.windowId].push(t.index);
					});

					for (const [k,v] of Object.entries(tmp)) {
						browser.tabs.highlight({
							windowId: parseInt(k),
							tabs: v,
							populate: false
						}); 
					}
				}
			}
		});
	}else{
		try {
			await browser.menus.remove(extname);
		}catch(e){
			console.error(e);
		}
	}
	browser.menus.refresh();

});


