const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('a11ykeys');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Meta = ExtensionUtils.getCurrentExtension();
const Utils = Meta.imports.utils;

let settings;

function init() {
	settings = Utils.getSettings(Meta);	
}

function buildPrefsWidget() {
	let frame = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, border_width: 10, margin: 20});
	
	//can not use constants here like STYLE_NUMLOCK etc, don't know why
	frame.add(_createItemCheckBox('stickykeys', _("Sticky Keys"), _("Shows sticky keys indicator")));
	frame.add(_createItemCheckBox('slowkeys', _("Slow Keys"), _("Shows slow keys indicator")));
	
	frame.show_all();
	return frame;
}

function _createItemCheckBox(item, text, tooltip) {
	let box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
	let label = new Gtk.Label({ label: text, xalign: 0, tooltip_text:tooltip });
	let widget = new Gtk.Switch({ active:  Utils.isItemEnabled(settings, item)});
	widget.connect('notify::active', function(switch_widget) {
		if (!widget.active && !Utils.canItemDisable(settings, item)) {
			widget.active = true;
			return;
		}
		
		Utils.setItemEnabled(settings, item, widget.active);
	});

	box.pack_start(label, true, true, 0);
	box.add(widget);
	return box;
}



