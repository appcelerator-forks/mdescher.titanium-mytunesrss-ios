package de.codewave.mytunesrss;

import org.appcelerator.titanium.TiApplication;

public class MytunesrssApplication extends TiApplication {

	@Override
	public void onCreate() {
		super.onCreate();
		
		appInfo = new MytunesrssAppInfo(this);
	}
}
