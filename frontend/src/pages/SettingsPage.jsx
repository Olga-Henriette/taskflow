import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  return (
    <MainLayout>
      <Card className="p-8 text-center">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Paramètres
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Cette section sera bientôt disponible
        </p>
      </Card>
    </MainLayout>
  );
};

export default SettingsPage;