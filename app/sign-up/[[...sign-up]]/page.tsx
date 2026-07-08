import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top left, rgba(139, 92, 246, 0.24), transparent 32%), #050711',
        padding: '24px',
      }}
    >
      <SignUp />
    </main>
  );
}