import { Link } from 'react-router-dom';
import { Zap, CheckCircle, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for small institutions getting started',
    features: [
      'Up to 100 students',
      'Basic attendance tracking',
      'Email notifications',
      'Mobile app access',
      'Standard support',
      '1 admin seat',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$299',
    period: '/month',
    description: 'For growing institutions with advanced needs',
    features: [
      'Up to 1,000 students',
      'AI-powered attendance',
      'Smart scheduling',
      'Advanced analytics',
      'Custom branding',
      '5 admin seats',
      'API access',
      'Priority support',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large institutions with custom requirements',
    features: [
      'Unlimited students',
      'All Professional features',
      'SmartBoard integration',
      'Custom integrations',
      'Dedicated success manager',
      'Unlimited admin seats',
      'SLA guarantee',
      'On-premise option',
      'SSO/SAML',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const faqs = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate the difference.',
  },
  {
    question: 'Is there a long-term contract?',
    answer: 'No, all plans are month-to-month. You can cancel anytime. Annual billing is available with a 20% discount.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, bank transfers (ACH), and purchase orders for Enterprise plans.',
  },
  {
    question: 'Do you offer discounts for educational institutions?',
    answer: 'Yes! We offer special pricing for K-12 schools, non-profits, and accredited universities. Contact our sales team for details.',
  },
  {
    question: 'What kind of support is included?',
    answer: 'Starter includes email support. Professional gets priority email and chat. Enterprise gets 24/7 phone support with a dedicated account manager.',
  },
  {
    question: 'How secure is my data?',
    answer: 'We use bank-grade encryption (AES-256 at rest, TLS 1.3 in transit), SOC 2 Type II certification, and are GDPR/FERPA compliant.',
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-primary">IntelliAttend</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/features" className="text-sm font-medium text-muted hover:text-primary transition-colors">Features</Link>
              <Link to="/products/smartboard" className="text-sm font-medium text-muted hover:text-primary transition-colors">SmartBoard</Link>
              <Link to="/products/faculty" className="text-sm font-medium text-muted hover:text-primary transition-colors">Faculty</Link>
              <Link to="/products/student" className="text-sm font-medium text-muted hover:text-primary transition-colors">Student</Link>
              <Link to="/pricing" className="text-sm font-medium text-primary">Pricing</Link>
              <Link to="/about" className="text-sm font-medium text-muted hover:text-primary transition-colors">About</Link>
              <Link to="/blog" className="text-sm font-medium text-muted hover:text-primary transition-colors">Blog</Link>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">Log in</Link>
              <Link to="/get-started" className="btn-primary w-auto h-10 px-6 text-sm">Get Started</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden py-20 lg:py-32" aria-labelledby="pricing-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 id="pricing-heading" className="page-title mb-6">Simple, transparent pricing</h1>
              <p className="page-subtitle mx-auto mb-10">Choose the plan that fits your institution. No hidden fees, cancel anytime.</p>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32" aria-labelledby="plans-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 id="plans-heading" className="sr-only">Pricing Plans</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <article
                  key={index}
                  className={`card-elevated p-8 relative flex flex-col ${plan.popular ? 'ring-2 ring-primary' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="badge badge-primary">Most Popular</span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="font-display text-xl font-semibold text-primary mb-2">{plan.name}</h3>
                    <p className="text-muted text-sm">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-muted">
                        <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.popular ? '/get-started' : '/contact'}
                    className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32 bg-slate-50" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 id="faq-heading" className="page-title mb-6">Frequently asked questions</h2>
              <p className="page-subtitle mx-auto">Everything you need to know about our pricing and plans</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="card-elevated group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="font-semibold text-primary">{faq.question}</span>
                    <svg className="h-5 w-5 text-muted group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <div className="px-6 pb-6 text-muted">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-32 bg-primary" aria-labelledby="pricing-cta-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 id="pricing-cta-heading" className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to get started?</h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">Join thousands of institutions already using IntelliAttend. Start your free trial today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-started" className="btn-primary w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link href="/contact" className="btn-secondary w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg text-primary">IntelliAttend</span>
              </Link>
              <p className="text-sm text-muted mb-6 max-w-xs">The intelligent foundation for modern educational institutions.</p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-sm text-muted hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/get-started" className="text-sm text-muted hover:text-primary transition-colors">Get Started</Link></li>
                <li><Link href="/products/smartboard" className="text-sm text-muted hover:text-primary transition-colors">SmartBoard</Link></li>
                <li><Link href="/products/faculty" className="text-sm text-muted hover:text-primary transition-colors">Faculty</Link></li>
                <li><Link href="/products/student" className="text-sm text-muted hover:text-primary transition-colors">Student</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-sm text-muted hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="text-sm text-muted hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-sm text-muted hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/blog" className="text-sm text-muted hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/support" className="text-sm text-muted hover:text-primary transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-sm text-muted hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-muted hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-sm text-muted hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted">© 2026 IntelliAttend Inc. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}