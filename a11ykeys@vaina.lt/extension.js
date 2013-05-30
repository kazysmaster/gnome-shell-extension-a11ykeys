const St = imports.gi.St;
const Lang = imports.lang;
const Gettext = imports.gettext.domain('a11ykeys');
const _ = Gettext.gettext;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const Panel = imports.ui.panel;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const MessageTray = imports.ui.messageTray;

const ExtensionUtils = imports.misc.extensionUtils;
const Meta = ExtensionUtils.getCurrentExtension();

const A11Y_SCHEMA = 'org.gnome.desktop.a11y.keyboard';
const KEY_STICKY_KEYS_ENABLED = 'stickykeys-enable';
const KEY_SLOW_KEYS_ENABLED   = 'slowkeys-enable';


let indicator;

function main() {
	enable();
}

function enable() {
	indicator = new A11yKeysIndicator();	
	Main.panel.addToStatusArea('a11ykeys', indicator, 1);
	indicator.setIndicatorEnabled(true);
}

function disable() {
	indicator.setIndicatorEnabled(false);
	indicator.destroy();
}

function A11yKeysIndicator() {
	this._init();
}

A11yKeysIndicator.prototype = {
	__proto__: PanelMenu.Button.prototype,

	_init: function() {
		PanelMenu.Button.prototype._init.call(this, St.Align.START);

		// For highlight to work properly you have to use themed
		// icons. Fortunately we can add our directory to the search path.
		Gtk.IconTheme.get_default().append_search_path(Meta.dir.get_child('icons').get_path());

		this.stickyIcon = new St.Icon({icon_name: "stickykeys-enabled-symbolic",
			style_class: 'system-status-icon'});
		this.slowIcon = new St.Icon({icon_name: "slowkeys-enabled-symbolic",
			style_class: 'system-status-icon'});

		this.layoutManager = new St.BoxLayout({vertical: false,
			style_class: 'a11ykeys-container'});
		this.layoutManager.add(this.stickyIcon);
		//this.layoutManager.add(this.slowIcon);
		this.actor.add_actor(this.layoutManager);
		this.a11ySettings = new Gio.Settings({ schema: A11Y_SCHEMA });
		this._updateState();
	},

	setIndicatorEnabled: function(enabled) {
		if (enabled) {
			this._stickykeysEnabledId = this.a11ySettings.connect('changed::'+KEY_STICKY_KEYS_ENABLED, Lang.bind(this, this._updateState));
			this._slowkeysEnabledId = this.a11ySettings.connect('changed::'+KEY_SLOW_KEYS_ENABLED, Lang.bind(this, this._updateState));
			this._updateState();
		} else {
			this.settings.disconnect(this._stickykeysEnabledId);
			this.settings.disconnect(this._slowkeysEnabledId);
		}
	}, 
    
    _updateState: function() {
		let stickykeys_enabled = this.a11ySettings.get_boolean(KEY_STICKY_KEYS_ENABLED);
		let slowkeys_enabled = this.a11ySettings.get_boolean(KEY_SLOW_KEYS_ENABLED);
		
		if (stickykeys_enabled)
			this.stickyIcon.set_icon_name("stickykeys-enabled-symbolic");
		else
			this.stickyIcon.set_icon_name("stickykeys-disabled-symbolic");

		if (slowkeys_enabled)
			this.slowIcon.set_icon_name("slowkeys-enabled-symbolic");
		else
			this.slowIcon.set_icon_name("slowkeys-disabled-symbolic");
		
	},	
}
