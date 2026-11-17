package kr.fortime.app;

import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import java.util.Map;

public class MainActivity extends BridgeActivity {

    @Override
    protected void load() {
        super.load();
        if (bridge != null) bridge.setWebViewClient(new PageClient(bridge));
    }

    /**
     * forTime 사이트는 페이지마다 폴더/index.html 구조(/ko/, /ko/result/fortune/ …)입니다.
     * Capacitor 기본 동작은 확장자 없는 주소를 모두 첫 화면(/index.html)으로 보내므로,
     * 앱 안 주소가 폴더로 끝나면 그 폴더의 index.html을 열도록 바꿔 줍니다. 주소창 경로는 그대로라 사이트 코드가 그대로 동작합니다.
     */
    static class PageClient extends BridgeWebViewClient {
        private final Bridge bridge;

        PageClient(Bridge bridge) {
            super(bridge);
            this.bridge = bridge;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            String host = url.getHost();
            String path = url.getPath();
            String appHost = Uri.parse(bridge.getAppUrl()).getHost();
            if (host != null && host.equals(appHost) && path != null && !path.equals("/") && !path.startsWith("/api/")) {
                String last = url.getLastPathSegment();
                if (last != null && !last.contains(".")) {
                    String fixed = path.endsWith("/") ? path + "index.html" : path + "/index.html";
                    return super.shouldInterceptRequest(view, new Rewritten(request, url.buildUpon().path(fixed).build()));
                }
            }
            return super.shouldInterceptRequest(view, request);
        }
    }

    /** 주소만 바꾼 요청 */
    static class Rewritten implements WebResourceRequest {
        private final WebResourceRequest base;
        private final Uri url;

        Rewritten(WebResourceRequest base, Uri url) {
            this.base = base;
            this.url = url;
        }

        @Override public Uri getUrl() { return url; }
        @Override public boolean isForMainFrame() { return base.isForMainFrame(); }
        @Override public boolean isRedirect() { return base.isRedirect(); }
        @Override public boolean hasGesture() { return base.hasGesture(); }
        @Override public String getMethod() { return base.getMethod(); }
        @Override public Map<String, String> getRequestHeaders() { return base.getRequestHeaders(); }
    }
}
