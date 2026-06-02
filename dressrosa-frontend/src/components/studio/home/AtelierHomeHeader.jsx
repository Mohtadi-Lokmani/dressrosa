import { Link } from 'react-router-dom';
import { Camera, Plus, Zap, ExternalLink, Edit, Share2 } from 'lucide-react';
import { ROUTES } from '../../../utils/constants';
import { getImageUrl } from '../../../utils/helpers';

/**
 * AtelierHomeHeader
 * Shows the seller's cover photo, profile photo, atelier name, quick stats, and action buttons.
 * This is the top section of the Studio Home page.
 */
const AtelierHomeHeader = ({ seller, onEditCover }) => {
  const quickActions = [
    {
      icon: Plus,
      label: 'Add Product',
      to: ROUTES.STUDIO_PRODUCTS_ADD,
      primary: true,
    },
    {
      icon: Zap,
      label: 'Boost',
      to: ROUTES.STUDIO_BOOST,
    },
    {
      icon: Edit,
      label: 'Edit Profile',
      to: ROUTES.STUDIO_PROFILE_EDIT,
    },
    {
      icon: ExternalLink,
      label: 'View Public Profile',
      to: seller?.userId ? `/seller/${seller.userId}` : '#',
      external: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Cover Photo */}
      <div className="relative h-52 bg-gradient-to-br from-burgundy/10 via-gray-100 to-gray-200 group">
        {seller?.bannerImage ? (
          <img
            src={getImageUrl(seller.bannerImage)}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-burgundy/5 via-burgundy/10 to-burgundy/5 flex items-center justify-center">
            <div className="text-center opacity-40">
              <Camera className="w-10 h-10 text-burgundy mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-medium">Add a cover photo</p>
            </div>
          </div>
        )}
        {/* Edit Cover button */}
        <button
          onClick={onEditCover}
          className="absolute bottom-4 right-4 flex items-center space-x-2 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-4 py-2 rounded-xl backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Edit cover photo</span>
        </button>
      </div>

      {/* Profile Row */}
      <div className="px-8 pb-6">
        {/* Profile Photo — overlaps cover */}
        <div className="flex items-end justify-between -mt-10 mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-burgundy to-burgundy-dark flex items-center justify-center overflow-hidden">
              {seller?.profilePhoto ? (
                <img
                  src={getImageUrl(seller.profilePhoto)}
                  alt={seller.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-black text-3xl">
                  {seller?.userName?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          {/* Share Button */}
          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-xl transition-all">
            <Share2 className="w-4 h-4" />
            <span className="font-semibold">Share</span>
          </button>
        </div>

        {/* Atelier Name & Meta */}
        <div className="mb-5">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {seller?.userName || 'My Atelier'}
          </h1>
          {seller?.bio && (
            <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-lg">
              {seller.bio}
            </p>
          )}
          <div className="flex items-center space-x-5 mt-3">
            <div className="text-center">
              <p className="text-xl font-black text-gray-900">{seller?.followersCount ?? 0}</p>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Followers</p>
            </div>
            <div className="w-px h-8 bg-gray-100"></div>
            <div className="text-center">
              <p className="text-xl font-black text-gray-900">{seller?.totalProducts ?? 0}</p>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Products</p>
            </div>
            {seller?.averageRating > 0 && (
              <>
                <div className="w-px h-8 bg-gray-100"></div>
                <div className="text-center">
                  <p className="text-xl font-black text-gray-900">
                    {seller.averageRating?.toFixed(1)} <span className="text-yellow-400">★</span>
                  </p>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rating</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              target={action.external ? '_blank' : undefined}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                action.primary
                  ? 'bg-burgundy text-white shadow-md shadow-burgundy/20 hover:bg-burgundy-dark hover:scale-[1.02] active:scale-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <action.icon className="w-4 h-4" />
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AtelierHomeHeader;
