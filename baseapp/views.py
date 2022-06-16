from django.shortcuts import render,redirect, get_object_or_404
from django.utils import timezone
from .models import Post, Comment, Category
from .forms import PostForm, CommentForm, RegistrationForm, PostSearchForm
from django.urls import reverse,reverse_lazy
from django.db.models import Q


from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import (TemplateView,ListView,DetailView,
                               CreateView,DeleteView,UpdateView,)


# Create your views here.

class RegistraionView(CreateView):
    form_class = RegistrationForm
    success_url = reverse_lazy('login')
    template_name = 'baseapp/register.html'


class AboutView(TemplateView):
    template_name = 'baseapp/about.html'

class PostListView(ListView):
    model = Post

    def get_queryset(self):

        return Post.objects.filter(published_date__lte = timezone.now()).order_by('-published_date')
        



class PostDetailView(DetailView):
    model = Post

class PostCreateView(LoginRequiredMixin,CreateView):
    login_url = '/login/'
    model = Post
    redirect_url_name = 'post_detail.html'
    form_class = PostForm

class PostUpdateView(LoginRequiredMixin, UpdateView):
    login_url = '/login/'
    model = Post
    redirect_url_name = 'post_detail.html'
    fields = ['title','text']

class PostDeleteView(LoginRequiredMixin, DeleteView):
    login_url = '/login/'
    model = Post
    success_url = reverse_lazy('post_list')

class PostDraftListView(ListView):
    model = Post

    
    def get_queryset(self):
        return Post.objects.filter(published_date__isnull = True).order_by('-published_date')


class PostCategoryView(ListView):
    model = Category
    template_name= 'baseapp/post_category.html'
    context_object_name = 'cat_list'

    def get_queryset(self):
        content={
            'cat': self.kwargs['category'],
            'post': Post.objects.filter(category__name=self.kwargs['category']) 
        }
        return content


   

class CategoryDetailView(DetailView):
    model = Category
    context_object_name = 'category'
    template_name = 'posts/post_category.html'


############################

def draft_count(request):
    draft = Post.objects.filter(published_date__isnull = True).count

    context={
        'draft':draft
    }
    return render(request, 'baseapp/post_list', context)

def post_publish(request, pk):
    post= get_object_or_404(Post, pk=pk)
    post.publish()
    return redirect('post_detail', pk=pk)

def add_comment_to_post(request, pk):
    post = get_object_or_404(Post, pk=pk)

    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post
            comment.save()
            return redirect('post_detail', pk=post.pk)

    else:
        form = CommentForm
    context={
        'form' : form
    }
    return render(request, 'baseapp/comment_form.html', context)

def comment_approve(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    comment.comment_approve()
    return redirect('post_detail', pk=comment.post.pk)

def comment_remove(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    post_pk = comment.post.pk
    comment.delete()
    return redirect('post_detail', pk=post_pk)

def category_list(request):
    category_list = Category.objects.exclude(name='uncategorized')

    context={
        'category_list': category_list
    }
    return context

def search_post(request):
    form = PostSearchForm
    q= ''
    c= ''
    results =[]
    query = Q()

    if 'q' in request.GET:
        form = PostSearchForm(request.GET)
        if form.is_valid():
            q = form.cleaned_data['q']
            c = form.cleaned_data['c']

            if c is not None:
                query &=Q(category = c)
            if q is not None:
                query &= Q(title__icontains=q)
            results = Post.objects.filter(query)


    context = {
        'form' : form,
        'results' : results,
        'q' : q
    }
    return render(request, 'baseapp/search.html', context)














