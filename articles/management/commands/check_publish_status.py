from django.core.management.base import BaseCommand
from articles.models import Article
from django.utils.timezone import now

class Command(BaseCommand):
    help = "Check and publish approved articles if the publish date is today."

    def handle(self, *args, **kwargs):
        print("Command file loaded")
        today = now().date()
        articles_to_publish = Article.objects.filter(status='approved', publish_date=today)
        for article in articles_to_publish:
            article.status = 'published'
            article.save()
            self.stdout.write(self.style.SUCCESS(f"Published article: {article.title}"))
