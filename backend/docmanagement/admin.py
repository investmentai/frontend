from django.contrib import admin
from .models import UserApiKey, LLMProvider, UserDocument, UserFolder

admin.site.register(UserApiKey)
admin.site.register(LLMProvider)
admin.site.register(UserDocument)
admin.site.register(UserFolder)
