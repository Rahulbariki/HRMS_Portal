import { Link } from 'react-router-dom';

export default function PlaceholderPage({ title, description, icon: Icon, href, btnText }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">{title}</h1>
        <p className="text-muted mt-1">{description}</p>
      </div>

      <div className="card-elevated p-8 text-center">
        {Icon && <Icon className="h-16 w-16 mx-auto text-muted/30 mb-6" />}
        <p className="text-muted mb-6">This page is under development.</p>
        {href && (
          <Link to={href} className="btn-primary w-auto inline-flex">
            {btnText || 'Go to Dashboard'}
          </Link>
        )}
      </div>
    </div>
  );
}