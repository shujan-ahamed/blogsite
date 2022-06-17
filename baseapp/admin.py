from django.contrib import admin
from .models import Post, Comment, Category
from ckeditor.widgets import CKEditorWidget

# Register your models here.
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Category)

