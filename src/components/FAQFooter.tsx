import React from 'react';

interface FAQFooterProps {
  currentColors: Record<string, string>;
}

const FAQFooter: React.FC<FAQFooterProps> = ({ currentColors }) => {
  return (
    <>
      <section id="faq" aria-labelledby="faq-heading" style={{
        marginTop: '48px',
        padding: '24px',
        backgroundColor: currentColors.cardBackground,
        borderRadius: '8px',
        border: `1px solid ${currentColors.border}`,
        boxShadow: `0 1px 3px ${currentColors.shadowColor}`
      }}>
        <h2 id="faq-heading" style={{ fontSize: '1.25rem', marginBottom: '16px', color: currentColors.text }}>Frequently Asked Questions</h2>

        <article style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '6px', color: currentColors.textSecondary, fontWeight: '600' }}>How secure are the passwords generated?</h3>
          <p style={{ color: currentColors.textMuted, lineHeight: 1.5, fontSize: '0.875rem' }}>
            Our password generator creates highly secure passwords using a combination of uppercase and lowercase letters,
            numbers, and special characters. All generation happens locally in your browser using the Web Crypto API's
            crypto.getRandomValues() function for cryptographically secure randomness, ensuring your passwords are never
            transmitted over the internet.
          </p>
        </article>

        <article style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '6px', color: currentColors.textSecondary, fontWeight: '600' }}>What makes a strong password?</h3>
          <p style={{ color: currentColors.textMuted, lineHeight: 1.5, fontSize: '0.875rem' }}>
            A strong password should be at least 12 characters long (we recommend 25+), include a mix of character types,
            avoid dictionary words and sequential patterns, and be unique for each account. Our generator handles all these
            requirements automatically.
          </p>
        </article>

        <article style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '6px', color: currentColors.textSecondary, fontWeight: '600' }}>Can I customize the password generation?</h3>
          <p style={{ color: currentColors.textMuted, lineHeight: 1.5, fontSize: '0.875rem' }}>
            Yes! You can adjust the length, choose which character types to include, exclude similar-looking characters,
            prevent duplicates, remove sequential patterns, and even define your own custom symbol set.
          </p>
        </article>

        <article>
          <h3 style={{ fontSize: '1rem', marginBottom: '6px', color: currentColors.textSecondary, fontWeight: '600' }}>Is my data being tracked or stored?</h3>
          <p style={{ color: currentColors.textMuted, lineHeight: 1.5, fontSize: '0.875rem' }}>
            No passwords or sensitive data are ever stored or transmitted. We use Google Analytics to understand site usage
            patterns, but this only tracks general visitor statistics, not any password-related information. Your settings
            are only saved locally in your browser if you explicitly choose to save them.
          </p>
        </article>
      </section>

      <footer role="contentinfo" style={{
        marginTop: '32px',
        paddingTop: '16px',
        borderTop: `1px solid ${currentColors.border}`,
        textAlign: 'center',
        color: currentColors.textMuted,
        fontSize: '0.75rem'
      }}>
        <p>© 2025 Secure Password Generator by Travis Harper. All rights reserved.</p>
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <a href="https://github.com/t-harper/passwordgen"
             style={{ color: currentColors.primary, textDecoration: 'none' }}
             target="_blank"
             rel="noopener noreferrer"
             aria-label="View source code on GitHub">
            View on GitHub
          </a>
          <span style={{ color: currentColors.border }}>•</span>
          <a href="https://buymeacoffee.com/travis.harper"
             style={{ color: currentColors.primary, textDecoration: 'none' }}
             target="_blank"
             rel="noopener noreferrer"
             aria-label="Support the developer - Buy me a beer">
            🍺 Buy me a beer
          </a>
        </div>
      </footer>
    </>
  );
};

export default FAQFooter;
