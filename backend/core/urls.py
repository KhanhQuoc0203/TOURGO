from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import LoginView, MeView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')), 
    path('api/tours/', include('tours.urls')), 
    path('api/login/', LoginView.as_view(), name='login_direct'),
    path('api/me/', MeView.as_view(), name='me'),
     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)