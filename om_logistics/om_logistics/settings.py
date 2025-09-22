INSTALLED_APPS = [
    ...
    'core',
]
# At the bottom of settings.py
import os

TEMPLATES[0]['DIRS'] = [os.path.join(BASE_DIR, 'core/templates')]
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'core/static')]
