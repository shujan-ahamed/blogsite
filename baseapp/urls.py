from django.urls import path

from .views import *

urlpatterns = [
    path('about/', AboutView.as_view(), name='about'),
    path('register/', RegistraionView.as_view(), name='register'),
    path('', PostListView.as_view(), name='post_list'),
    path('post/<str:pk>/', PostDetailView.as_view(), name='post_detail'),
    path('post/', PostCreateView.as_view(), name='create_post'),
    path('post/<str:pk>/edit/', PostUpdateView.as_view(), name='post_edit'),
    path('post/<str:pk>/remove/', PostDeleteView.as_view(), name='post_remove'),
    path('draft/', PostDraftListView.as_view(), name='post_draft'),
    path('category/<category>', PostCategoryView.as_view(), name='post_category'),
    path('post/<str:pk>/publish/', post_publish, name='post_publish'),
    path('post/<str:pk>/comment/', add_comment_to_post, name='add_comment_to_post'),
    path('comment/<str:pk>/approve/', comment_approve, name='comment_approve'),
    path('comment/<str:pk>/remove/', comment_remove, name='comment_remove'),  
    path('comment/<str:pk>/publilsh/', comment_approve, name='comment_publish'),        
    path('search/', search_post, name='search_post'),        

]