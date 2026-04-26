import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Camera, Package, FileText, MessageCircle, Users, ChevronRight } from 'lucide-react';
import { ROUTES } from '../../../utils/constants';

const checklistItems = [
  {
    id: 'cover',
    icon: Camera,
    title: 'Add a cover photo',
    description: 'Make your Atelier stand out with a beautiful cover image.',
    actionPath: ROUTES.STUDIO_PROFILE_EDIT,
    actionLabel: 'Add Photo',
    checkFn: (seller) => !!seller?.bannerImage,
  },
  {
    id: 'product',
    icon: Package,
    title: 'List your first product',
    description: 'Start selling by adding your first piece to the marketplace.',
    actionPath: ROUTES.STUDIO_PRODUCTS_ADD,
    actionLabel: 'Add Product',
    checkFn: (seller) => (seller?.totalProducts ?? 0) > 0,
  },
  {
    id: 'bio',
    icon: FileText,
    title: 'Write your Atelier bio',
    description: 'Tell buyers about your craft, inspiration, and what you create.',
    actionPath: ROUTES.STUDIO_PROFILE_EDIT,
    actionLabel: 'Write Bio',
    checkFn: (seller) => !!seller?.bio && seller.bio.length > 10,
  },
  {
    id: 'message',
    icon: MessageCircle,
    title: 'Respond to your first buyer',
    description: 'Build trust by replying to buyer inquiries quickly.',
    actionPath: ROUTES.STUDIO_MESSAGES,
    actionLabel: 'View Messages',
    checkFn: () => false, // needs API data
  },
  {
    id: 'follower',
    icon: Users,
    title: 'Get your first follower',
    description: 'Build your community and grow your Atelier audience.',
    actionPath: ROUTES.STUDIO_HOME,
    actionLabel: 'Share Profile',
    checkFn: (seller) => (seller?.followersCount ?? 0) > 0,
  },
];

/**
 * SetupChecklist
 * Shows onboarding steps as horizontal scrollable cards.
 * Disappears once all steps are complete.
 */
const SetupChecklist = ({ seller }) => {
  const items = checklistItems.map((item) => ({
    ...item,
    isComplete: item.checkFn(seller),
  }));

  const completedCount = items.filter((i) => i.isComplete).length;
  const allComplete = completedCount === items.length;

  // Hide when all complete
  if (allComplete) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Get your Atelier ready</h3>
          <p className="text-xs text-burgundy font-semibold mt-0.5">
            {completedCount} of {items.length} steps completed
          </p>
        </div>
        {/* Progress ring */}
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#f1f1f1" strokeWidth="4" />
            <circle
              cx="20" cy="20" r="16"
              fill="none"
              stroke="#800020"
              strokeWidth="4"
              strokeDasharray={`${(completedCount / items.length) * 100.53} 100.53`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-burgundy">
            {completedCount}/{items.length}
          </span>
        </div>
      </div>

      {/* Scrollable Cards */}
      <div className="flex space-x-4 overflow-x-auto px-6 py-5 scrollbar-hide">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex-shrink-0 w-56 border rounded-xl p-4 transition-all duration-200 ${
              item.isComplete
                ? 'bg-green-50/50 border-green-100'
                : 'bg-white border-gray-100 hover:border-burgundy/20 hover:shadow-sm'
            }`}
          >
            {/* Icon & Status */}
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                item.isComplete ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <item.icon className={`w-5 h-5 ${item.isComplete ? 'text-green-600' : 'text-gray-500'}`} />
              </div>
              {item.isComplete ? (
                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Complete ✓
                </span>
              ) : (
                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  To do
                </span>
              )}
            </div>

            {/* Content */}
            <h4 className={`text-sm font-bold mb-1 leading-tight ${item.isComplete ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {item.title}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              {item.description}
            </p>

            {/* Action */}
            {!item.isComplete && (
              <Link
                to={item.actionPath}
                className="inline-flex items-center space-x-1 text-xs font-bold text-burgundy hover:underline"
              >
                <span>{item.actionLabel}</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetupChecklist;
