/**
 * User Response Serializer Mapper for RedDrop AI V2
 */

class UserMapper {
  /**
   * Serialize raw database user row to public clean API DTO
   */
  static toDTO(user, profile = {}, roles = []) {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      emailVerified: Boolean(user.email_verified),
      name: profile.name || user.name || null,
      phone: profile.phone || user.phone || null,
      gender: profile.gender || null,
      bloodGroup: profile.blood_group || user.bloodGroup || null,
      avatarUrl: profile.avatar_url || user.avatarUrl || null,
      roles: Array.isArray(roles) && roles.length > 0 ? roles : (user.role ? [user.role] : ['patient']),
      isActive: Boolean(user.is_active ?? true),
      location: (profile.location_lat && profile.location_lng) ? {
        latitude: parseFloat(profile.location_lat),
        longitude: parseFloat(profile.location_lng),
        city: profile.city || null,
        state: profile.state || null,
        address: profile.address || null
      } : null,
      createdAt: user.created_at || new Date()
    };
  }
}

module.exports = UserMapper;
