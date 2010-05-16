package de.codewave.mytunesrss;

import org.appcelerator.titanium.ITiAppInfo;
import org.appcelerator.titanium.TiApplication;
import org.appcelerator.titanium.TiProperties;
import org.appcelerator.titanium.util.Log;

/* GENERATED CODE
 * Warning - this class was generated from your application's tiapp.xml
 * Any changes you make here will be overwritten
 */
public class MytunesrssAppInfo implements ITiAppInfo
{
	private static final String LCAT = "AppInfo";
	
	
	public MytunesrssAppInfo(TiApplication app) {
		TiProperties properties = app.getSystemProperties();
					
		properties.setString("ti.deploytype", "development");
	}
	
	public String getId() {
		return "de.codewave.mytunesrss";
	}
	
	public String getName() {
		return "MyTunesRSS";
	}
	
	public String getVersion() {
		return "1.0.0";
	}
	
	public String getPublisher() {
		return "Codewave Software Michael Descher";
	}
	
	public String getUrl() {
		return "http://www.codewave.de";
	}
	
	public String getCopyright() {
		return "2010 by Codewave Software Michael Descher";
	}
	
	public String getDescription() {
		return "MyTunesRSS Mobile Client";
	}
	
	public String getIcon() {
		return "appicon.png";
	}
	
	public boolean isAnalyticsEnabled() {
		return true;
	}
	
	public String getGUID() {
		return "3f7a77b1-0ac0-474d-b05f-74f0b9887b58";
	}
	
	public boolean isFullscreen() {
		return false;
	}
	
	public boolean isNavBarHidden() {
		return false;
	}
}
