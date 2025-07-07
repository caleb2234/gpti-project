import { Button } from "@/components/ui/button";

export default function Login() {
    const handleLogin = () => {
        window.location.href = "http://localhost:3001/auth/google";
    };
    return (
        <div className='justify-center'>
            <Button onClick = {handleLogin}>
                Sign in with Google
            </Button>
        </div>
    )
}