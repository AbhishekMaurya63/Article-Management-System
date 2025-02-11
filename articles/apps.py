from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.core.management import call_command
# import articles.management.commands.check_publish_status
class ArticlesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'articles'
    def ready(self):
        # Use post_migrate to avoid accessing the database during initialization
        post_migrate.connect(self.run_check_publish_status, sender=self)

    def run_check_publish_status(self, **kwargs):
        try:
            call_command('check_publish_status')
        except Exception as e:
            print(f"Error during startup checks: {e}")

