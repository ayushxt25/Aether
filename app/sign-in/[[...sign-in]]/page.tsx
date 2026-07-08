import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
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
      <SignIn />
    </main>
  );
}