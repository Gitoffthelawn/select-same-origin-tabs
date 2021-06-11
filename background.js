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

			// handle other windows where the context menu wasn't created 
			let tmp = {};
			tabs.forEach( (t) => {
				if (typeof tmp[t.windowId] === 'undefined'){
					tmp[t.windowId] = [];
				} 
				tmp[t.windowId].push(t.index);
			});

			console.log(JSON.stringify(tmp,null,4));
			for (const [k,v] of Object.entries(tmp)) {
				// use != because k is a string and not an integer
				if( k != tab.winodwId) {
					browser.tabs.highlight({
						windowId: parseInt(k),
						tabs: v,
						populate: false
					}); 
				}
			}

			// process tab + window where the context menu was created from 
			tmp[tab.windowId].unshift(tab.index);

			browser.tabs.highlight({
				windowId: tab.windowId,
				tabs: tmp[tab.windowId],
				populate: false
			}); 

			
		}
	}
});


