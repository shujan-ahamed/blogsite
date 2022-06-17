from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse,reverse_lazy



# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=30)

    def __str__(self) -> str:
        return self.name

    

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=250)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, default=1, null=True)
    text = models.TextField(null= True, blank =True)
    #text = models.TextField()
    created_date = models.DateTimeField(default = timezone.now)
    published_date = models.DateTimeField(null=True, blank=True)

    def form_valid(self, PostForm):
        # This method is called when valid form data has been POSTed.
        # It should return an HttpResponse.

        form = PostForm.save(commit=False)
        form.author = self.request.user
        form.save()

        return super().form_valid(form)

    def publish(self):
        self.published_date = timezone.now()
        self.save()

    def approved_comments(self):
        return self.comments.filter(approve_comment = True)

    def __str__(self) -> str:
        return self.title

    def get_absolute_url(self):
        return reverse('post_detail',kwargs={'pk':self.pk})

class Comment(models.Model):
    author = models.CharField(max_length=30)
    post = models.ForeignKey(Post,related_name='comments', on_delete=models.CASCADE)
    text = models.CharField(max_length=250)
    created_date = models.DateTimeField(default= timezone.now)
    approve_comment = models.BooleanField(default=False)

    def comment_approve(self):
        self.approve_comment = True
        self.save()
