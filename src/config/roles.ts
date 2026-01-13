export enum Role {
    ADMIN = 'admin',
    USER = 'user'
}

export enum Permission {

    // User Management
    USERS_VIEW = 'users:view',
    USERS_MANAGE = 'users:manage',
    PERMISSIONS_MANAGE = 'permissions:manage',

    // Post Management
    POSTS_CREATE = 'posts:create',
    POSTS_EDIT_OWN = 'posts:edit:own',
    POSTS_DELETE_OWN = 'posts:delete:own',
    POSTS_VIEW = 'posts:view',
    POSTS_MANAGE_ALL = 'posts:manage:all',
    // Comment Permissions
    COMMENTS_CREATE = 'comments:create',
    COMMENTS_EDIT_OWN = 'comments:edit:own',
    COMMENTS_DELETE_OWN = 'comments:delete:own',
    COMMENTS_MANAGE_ALL = 'comments:manage:all',
}


export const RolePermissions: Record<Role, Permission[]> = {
    [Role.ADMIN]: [
        Permission.USERS_VIEW,
        Permission.USERS_MANAGE,
        Permission.PERMISSIONS_MANAGE,
        Permission.POSTS_CREATE,
        Permission.POSTS_EDIT_OWN,
        Permission.POSTS_DELETE_OWN,
        Permission.POSTS_VIEW,
        Permission.POSTS_MANAGE_ALL,
        Permission.COMMENTS_CREATE,
        Permission.COMMENTS_EDIT_OWN,
        Permission.COMMENTS_DELETE_OWN,
        Permission.COMMENTS_MANAGE_ALL
    ],
    [Role.USER]: [
        Permission.POSTS_CREATE,
        Permission.POSTS_EDIT_OWN,
        Permission.POSTS_DELETE_OWN,
        Permission.POSTS_VIEW,
        Permission.COMMENTS_CREATE,
        Permission.COMMENTS_EDIT_OWN,
        Permission.COMMENTS_DELETE_OWN
    ]
};
