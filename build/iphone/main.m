//
//  Appcelerator Titanium Mobile
//  WARNING: this is a generated file and should not be modified
//

#import <UIKit/UIKit.h>
#define _QUOTEME(x) #x
#define STRING(x) _QUOTEME(x)

NSString * const TI_APPLICATION_DEPLOYTYPE = @"production";
NSString * const TI_APPLICATION_ID = @"de.codewave.mytunesrss";
NSString * const TI_APPLICATION_PUBLISHER = @"Codewave Software Michael Descher";
NSString * const TI_APPLICATION_URL = @"http://www.codewave.de";
NSString * const TI_APPLICATION_NAME = @"MyTunesRSS";
NSString * const TI_APPLICATION_VERSION = @"1.0.0";
NSString * const TI_APPLICATION_DESCRIPTION = @"MyTunesRSS Mobile Client";
NSString * const TI_APPLICATION_COPYRIGHT = @"2010 by Codewave Software Michael Descher";
NSString * const TI_APPLICATION_GUID = @"3f7a77b1-0ac0-474d-b05f-74f0b9887b58";
BOOL const TI_APPLICATION_ANALYTICS = true;

#ifdef TARGET_IPHONE_SIMULATOR
NSString * const TI_APPLICATION_RESOURCE_DIR = @"";
#endif

int main(int argc, char *argv[]) {
    NSAutoreleasePool * pool = [[NSAutoreleasePool alloc] init];

#ifdef __LOG__ID__
	NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
	NSString *documentsDirectory = [paths objectAtIndex:0];
	NSString *logPath = [documentsDirectory stringByAppendingPathComponent:[NSString stringWithFormat:@"%s.log",STRING(__LOG__ID__)]];
	freopen([logPath cStringUsingEncoding:NSUTF8StringEncoding],"w+",stderr);
	fprintf(stderr,"[INFO] Application started\n");
#endif

    int retVal = UIApplicationMain(argc, argv, nil, nil);
    [pool release];
    return retVal;
}
