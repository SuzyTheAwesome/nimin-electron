import { BrowserWindow as e, app as t, dialog as n, ipcMain as r } from "electron";
import { fileURLToPath as i } from "node:url";
import a from "node:path";
import o from "node:fs";
import s from "electron-store";
//#region electron/main.ts
var c = a.dirname(i(import.meta.url)), l = process.env.VITE_DEV_SERVER_URL, u = new s({ name: "nimin-saves" });
r.on("save:getSync", (e, t) => {
	e.returnValue = u.get(t) ?? null;
}), r.on("save:hasSync", (e, t) => {
	e.returnValue = u.has(t);
}), r.on("save:keysSync", (e) => {
	e.returnValue = Object.keys(u.store);
}), r.handle("save:set", (e, t, n) => {
	u.set(t, n);
}), r.handle("save:delete", (e, t) => {
	u.delete(t);
}), r.handle("save:exportFile", async (t, r) => {
	let i = e.getFocusedWindow(), a = await n.showSaveDialog(i, {
		title: "Export Nimin Save",
		defaultPath: "Nimin_Save.nim",
		filters: [{
			name: "Nimin Save",
			extensions: ["nim", "json"]
		}]
	});
	return a.canceled || !a.filePath ? !1 : (o.writeFileSync(a.filePath, JSON.stringify(r, null, 2), "utf-8"), !0);
}), r.handle("save:importFile", async () => {
	let t = e.getFocusedWindow(), r = await n.showOpenDialog(t, {
		title: "Import Nimin Save",
		properties: ["openFile"],
		filters: [{
			name: "Nimin Save",
			extensions: ["nim", "json"]
		}]
	});
	if (r.canceled || r.filePaths.length === 0) return null;
	try {
		let e = o.readFileSync(r.filePaths[0], "utf-8");
		return JSON.parse(e);
	} catch {
		return null;
	}
});
function d() {
	let t = new e({
		width: 1024,
		height: 768,
		minWidth: 800,
		minHeight: 600,
		title: "Nimin: Fetish Fantasy",
		backgroundColor: "#1a1a1a",
		webPreferences: {
			preload: a.join(c, "preload.cjs"),
			nodeIntegration: !1,
			contextIsolation: !0
		}
	});
	l ? (t.loadURL(l), t.webContents.openDevTools({ mode: "detach" })) : t.loadFile(a.join(c, "../dist/index.html"));
}
t.whenReady().then(d), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
}), t.on("activate", () => {
	e.getAllWindows().length === 0 && d();
});
//#endregion

//# sourceMappingURL=main.mjs.map