from django import forms

class LocationForm(forms.Form):
    """
    form containing fields for lat/lng coordinates,address and calendar
    """
    address = forms.CharField()
    lat = forms.FloatField()
    lng = forms.FloatField()
    hours = (
       (0, ("00")),
       (1, ("01")),
       (2, ("02")),
       (3, ("03")),
       (4, ("04")),
       (5, ("05")),
       (6, ("06")),
       (7, ("07")),
       (8, ("08")),
       (9, ("09")),
       (10, ("10")),
       (11, ("11")),
       (12, ("12")),
       (13, ("13")),
       (14, ("14")),
       (15, ("15")),
       (16, ("16")),
       (17, ("17")),
       (18, ("18")),
       (19, ("19")),
       (20, ("20")),
       (21, ("21")),
       (22, ("22")),
       (23, ("23")),
    )
    from_hour = forms.ChoiceField(choices=hours)
    to_hour = forms.ChoiceField(choices=hours)
    periods = (
       (00, ("00")),
       (15, ("15")),
       (30, ("30")),
       (45, ("45")),
    )
    from_period = forms.ChoiceField(choices=periods)
    to_period = forms.ChoiceField(choices=periods)
    from_date = forms.CharField();
    to_date = forms.CharField();

class SubscribeForm(forms.Form):
    email = forms.EmailField()
    is_parkingowner = forms.BooleanField(required=False)
    
class GetHomeParking(forms.Form):
    id = forms.CharField()