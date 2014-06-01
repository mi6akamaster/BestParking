from django.contrib import admin
from home.models import HomePageNewsFeed, Viewer, ParkingOwner

class TinyMCEAdmin(admin.ModelAdmin):
    class Media:
        js = ('/static/js/tiny_mce//tiny_mce.js', '/static/js/tiny_mce/textareas.js',)

class ViewerAdmin(admin.ModelAdmin):
    search_fields = ['email']
    list_display = ['email']

class ParkingOwnerAdmin(admin.ModelAdmin):
    search_fields = ['email']
    list_display = ['email']  
    
admin.site.register(HomePageNewsFeed, TinyMCEAdmin)
admin.site.register(Viewer, ViewerAdmin)
admin.site.register(ParkingOwner, ParkingOwnerAdmin)
