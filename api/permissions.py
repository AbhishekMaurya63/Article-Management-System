# api/permissions.py

from rest_framework import permissions

class IsEditorOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow Editors and Admins to approve or publish articles.
    """
    def has_permission(self, request, view):
        if view.action in ['approve', 'publish','rejected']:
            return request.user.is_staff  # Editors and Admins have staff status
        return True
# class IsAdmiin(permissions.BasePermission):
#     def has_permission(self,rewuest,view):

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff and request.user.is_superuser


