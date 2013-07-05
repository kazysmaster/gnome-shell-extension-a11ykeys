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
const Utils = Meta.imports.utils;

let indicator;

function main() {
	enable();
}

function enable() {
	indicator = new A11yKeysIndicator();	
	Main.panel.addToStatusArea('a11ykeys', indicator, 1);
}

function disable() {
	indicator.destroy();
}

function A11yKeysIndicator() {
	this._init();
}

A11yKeysIndicator.prototype = {
	__proto__: PanelMenu.Button.prototype,

	_init: function() {
		PanelMenu.Button.prototype._init.call(this, St.Align.START);
		this.actor._delegate = this;

		// For highlight to work properly you have to use themed
		// icons. Fortunately we can add our directory to the search path.
		Gtk.IconTheme.get_default().append_search_path(Meta.dir.get_child('icons').get_path());
		this.a11y_settings = new Gio.Settings({ schema: 'org.gnome.desktop.a11y.keyboard' });
		
		this.indicators = [];
		this.indicators.push(new BinaryIndicator('stickykeys', this.a11y_settings, 'stickykeys-enable'));		
		this.indicators.push(new BinaryIndicator('slowkeys', this.a11y_settings, 'slowkeys-enable'));
		
		this.layoutManager = new St.BoxLayout({vertical: false, style_class: 'a11ykeys-container'});
		this.actor.add_actor(this.layoutManager);
		for (i in this.indicators) {			
			this.layoutManager.add(this.indicators[i].actor);
		}
		
		this.extenstion_settings = Utils.getSettings(Meta);
		this.extenstion_settings.connect("changed::" + Utils.INDICATORS_KEY, Lang.bind(this, this._onExtensionSettingsChange));
		this._onExtensionSettingsChange();
	},
	
	destroy: function() {
		PanelMenu.Button.prototype.destroy.call(this);
	},
	
	_onExtensionSettingsChange: function() {
		for (i in this.indicators) {			
			this.layoutManager.add(this.indicators[i].container);
			if (Utils.isItemEnabled(this.extenstion_settings, this.indicators[i].indicator_name)){
				this.indicators[i].actor.show();
			} else {
				this.indicators[i].actor.hide();
			}
		}
	},
}

function BinaryIndicator(indicator_name, a11y_settings, a11y_settings_key) {
	this._init(indicator_name, a11y_settings, a11y_settings_key);
}

BinaryIndicator.prototype = {
	__proto__: PanelMenu.Button.prototype,
	
	_init: function(indicator_name, a11y_settings, a11y_settings_key) {
		PanelMenu.Button.prototype._init.call(this, St.Align.START);
		this.actor._delegate = this;
		this._minHPadding = this._natHPadding = 0.0;
		
		this.indicator_name = indicator_name;
		this.icon = new St.Icon({icon_name: this.indicator_name + '-enabled-symbolic', style_class: 'system-status-icon'});
		this.actor.add_actor(this.icon);
		
		this.a11y_settings = a11y_settings;
		this.a11y_settings_key = a11y_settings_key;
				
		this.icon_id = this.actor.connect('button-press-event', Lang.bind(this, this._handleButtonPress));
		this.a11y_settings_id = this.a11y_settings.connect('changed::'+this.a11y_settings_key, Lang.bind(this, this._updateState));
		
		this._updateState();
	},
	
	destroy: function() {
		this.a11y_settings.disconnect(this.a11y_settings_id);
		PanelMenu.Button.prototype.destroy.call(this);
	},
	
	_onStyleChanged: function(actor) {
		this._minHPadding = this._natHPadding = 0.0;
	},
	
	_handleButtonPress: function(actor, event) { 
		let button = event.get_button(); 
		if (button == 1) {
			let is_enabled = this.a11y_settings.get_boolean(this.a11y_settings_key);
			this.a11y_settings.set_boolean(this.a11y_settings_key, !is_enabled);
			global.log("indicator " + this.a11y_settings_key + ":" + !is_enabled);
		}
	},
	
	 _updateState: function() {
		let is_enabled = this.a11y_settings.get_boolean(this.a11y_settings_key);
		
		if (is_enabled)
			this.icon.set_icon_name(this.indicator_name + '-enabled-symbolic');
		else
			this.icon.set_icon_name(this.indicator_name + '-disabled-symbolic');

	},
}


