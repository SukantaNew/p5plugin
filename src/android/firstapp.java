package cordova.plugin.firstapp;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.TimeZone;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaInterface;


/*For toast and context*/
import android.content.Context;
import android.widget.Toast;
import android.provider.Settings;
import android.util.Log;
import static android.content.Context.TELEPHONY_SERVICE;
import android.telephony.TelephonyManager;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.WindowManager;

/**
 * This class echoes a string called from JavaScript.
 */
public class firstapp extends CordovaPlugin {

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("p5CallTrack")) {
            String message = args.getString(0);
            this.p5CallTrack(message, callbackContext);
            return true;
        }
        return false;
    }

    public void p5CallTrack(String message, CallbackContext callbackContext) {
        if (message != null && message.length() > 0) {

            //String uuid = Settings.Secure.getString(this.cordova.getActivity().getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
            Context context = this.cordova.getActivity().getApplicationContext();

           // JSONArray deviceArray = new JSONArray();
            JSONObject  r = new JSONObject();
            try {
                r.put("uuid", getDeviceId(context));
                r.put("manufacturer", getManufacturer());
                r.put("model", getModel());
                r.put("os", getOS());
                r.put("osversion", getOSVersion());        
                r.put("carrier", getCarrier(context));
                r.put("resolution", getResolution(context));
                r.put("appversion", getAppVersion(context));

                //deviceArray.put(r);
        } catch (final JSONException ignored) {
        }

        

            //String uuid=getDeviceId(context);
            callbackContext.success(r.toString());
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }


    // Device Information-----------------------------------------------------------


    public static String getDeviceId(Context context) {
        
        String uuid = Settings.Secure.getString(context.getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
        return uuid;

    }
    public String getManufacturer() {
        String manufacturer = android.os.Build.MANUFACTURER;
        return manufacturer;
    }
    public static String getModel() {
        return android.os.Build.MODEL;
    }
    public static String getOS() {
        return "Android";
    }

    public static String getOSVersion() {
        return android.os.Build.VERSION.RELEASE;
    }

    public static String getCarrier(final Context context) {
        String carrier = "";
        final TelephonyManager manager = (TelephonyManager) context.getSystemService(TELEPHONY_SERVICE);
        if (manager != null) {
            carrier = manager.getNetworkOperatorName();
        }
        if (carrier == null || carrier.length() == 0) {
            carrier = "";
            //Log.d(TAG, "Unable to retrieve Carrier information.");

        }
        return carrier;
    }

    public static String getResolution(final Context context) {
        String resolution = "";
        try {
            final WindowManager wm = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
            final Display display = wm.getDefaultDisplay();
            final DisplayMetrics metrics = new DisplayMetrics();
            display.getMetrics(metrics);
            resolution = metrics.widthPixels + "x" + metrics.heightPixels;
        } catch (final Throwable t) {
            //Log.d(TAG, "Unable to retrieve device resolution.");
        }
        return resolution;
    }

    public static String getAppVersion(final Context context) {
        final String result = "1.6.5";
        // try {
        // result = context.getPackageManager().getPackageInfo(context.getPackageName(),
        // 0).versionName;
        // } catch (PackageManager.NameNotFoundException e) {
        // Log.d("p5 - DeviceInfo", "Unable to retrieve application version.");
        //
        // }
        return result;
    }
    
}
