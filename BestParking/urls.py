from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings
import os
admin.autodiscover()
def fromRelativePath(*relativeComponents):
    return os.path.join(os.path.dirname(__file__), *relativeComponents).replace("\\","/")

urlpatternstinymce = patterns('tinymce.views',
    url(r'^js/textareas/(?P<name>.+)/$', 'textareas_js', name='tinymce-js'),
    url(r'^js/textareas/(?P<name>.+)/(?P<lang>.*)$', 'textareas_js', name='tinymce-js-lang'),
    url(r'^spellchecker/$', 'spell_check'),
    url(r'^flatpages_link_list/$', 'flatpages_link_list'),
    url(r'^compressor/$', 'compressor', name='tinymce-compressor'),
    url(r'^filebrowser/$', 'filebrowser', name='tinymce-filebrowser'),
    url(r'^preview/(?P<name>.+)/$', 'preview', name='tinymce-preview'),
)

urlpatterns = patterns('',
    url(r'^$', 'home.views.home'),            
    url(r'^admin/', include(admin.site.urls)),
    url("^admin-media/(?P<path>.*)$",
    "django.views.static.serve",
    {"document_root": fromRelativePath("media", "admin-media")}),
    url(r'^findparking/$', 'FindParking.views.FindParking'),
    url(r'^tinymce/', include(urlpatternstinymce)),
    url(r'^useful/$', 'useful.views.loadInfo'),
    url(r'^findparking/ajaxCall/(?P<latlng>.*)$', 'FindParking.views.ajaxCall'),
    url(r'^ajaxCall/(?P<latlng>.*)$', 'FindParking.views.ajaxCall'),
    url(r'^useful/(?P<city>.*)$', 'useful.views.loadInfoForCity'),
             url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
)
