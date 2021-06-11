//const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?
const manifest = browser.runtime.getManifest();
const extname = manifest.name;
const extdesc = manifest.description

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

			// handle tabs (also from other windows) where the context menu was not triggerd on
			let tmp = {};
			tabs.forEach( (t) => {
				if(t.id !== tab.id){ // exclude 
					if (typeof tmp[t.windowId] === 'undefined'){
						tmp[t.windowId] = [];
					} 
					tmp[t.windowId].push(t.index);
				}
			});
			for (const [k,v] of Object.entries(tmp)) {
				// use != because k might not have the same type as tab.windowId  
				if( k != tab.winodwId) {
					browser.tabs.highlight({
						windowId: parseInt(k),
						tabs: v,
						populate: false
					}); 
				}
			}

			// process tab where the context menu was triggerd on 
			if (typeof tmp[tab.windowId] === 'undefined'){
				tmp[tab.windowId] = [];
			}
			tmp[tab.windowId].unshift(tab.index);

			browser.tabs.highlight({
				windowId: tab.windowId,
				tabs: tmp[tab.windowId],
				populate: false
			}); 
			
		}
	}
});


