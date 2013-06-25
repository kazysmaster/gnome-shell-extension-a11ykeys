const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;

const Config = imports.misc.config;
const Gettext = imports.gettext;

const INDICATORS_KEY = 'indicators';
const SCHEMA = 'org.gnome.shell.extensions.a11ykeys';

function getSettings(extension) { 

	const GioSSS = Gio.SettingsSchemaSource;

	let schemaDir = extension.dir.get_child('schemas');
	let schemaSource;
	if (schemaDir.query_exists(null)) {
		schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
				GioSSS.get_default(),
				false);
	} else {
		schemaSource = GioSSS.get_default();
	}

	let schemaObj = schemaSource.lookup(SCHEMA, true);
	if (!schemaObj) {
		throw new Error('Schema ' + SCHEMA + ' could not be found for extension ' +
				extension.metadata.uuid + '. Please check your installation.');
	}

	return new Gio.Settings({settings_schema: schemaObj});
}

function isItemEnabled(gsettings, item) {
	let indicator_list = gsettings.get_strv(INDICATORS_KEY);
	return indicator_list.indexOf(item) >= 0;
}

function canItemDisable(gsettings, item) {
	let indicator_list = gsettings.get_strv(INDICATORS_KEY);
	return indicator_list.length > 1 && indicator_list.indexOf(item) >= 0;
}


function setItemEnabled(gsettings, item, enable) {
	let indicator_list = gsettings.get_strv(INDICATORS_KEY);
	let index = indicator_list.indexOf(item);
	if (enable) {
		if (index < 0) {
			indicator_list.push(item);
		}
	} else {
		if (index >= 0) {
			indicator_list.splice(index, 1);
		}
	}
	
	gsettings.set_strv(INDICATORS_KEY, indicator_list);
}

