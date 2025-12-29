import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Logo from '../components/common/Logo';
import { LogOut, User } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-app py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenu */}
      <main className="container-app py-8">
        <Card className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <User className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Bienvenue, {user?.firstName} ! 🎉
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous êtes connecté avec succès ! Le dashboard complet arrive bientôt.
          </p>
          
          <div className="space-y-2 text-sm text-left max-w-md mx-auto">
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Email:</strong> {user?.email}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Téléphone:</strong> {user?.phone}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Compte créé:</strong> {new Date(user?.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default DashboardPage;