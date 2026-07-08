'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@matchpulse/ui';
import { Button } from '@matchpulse/ui';
import { Input } from '@matchpulse/ui';
import { User, Mail, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
  plan: string;
  createdAt: string;
  strategiesCount: number;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{success: boolean, data: UserProfile}>('/users/profile');
      setProfile(response.data);
      setName(response.data?.name || user?.displayName || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to Firebase user data
      if (user) {
        setProfile({
          name: user.displayName || '',
          email: user.email || '',
          plan: 'FREE',
          createdAt: user.metadata.creationTime || new Date().toISOString(),
          strategiesCount: 0,
        });
        setName(user.displayName || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.patch('/users/profile', { name });
      setProfile(prev => prev ? { ...prev, name } : null);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      try {
        await apiClient.delete('/users/profile');
      } catch (apiError: unknown) {
        // If user doesn't exist in database (404), just proceed with Firebase logout
        const error = apiError as { message?: string };
        if (error.message?.includes('404') || error.message?.includes('User not found')) {
          console.log('User not found in database, proceeding with Firebase account deletion');
        } else {
          throw apiError;
        }
      }
      
      // Delete Firebase account
      if (user) {
        await user.delete();
      }
      
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Erro ao deletar conta. Tente novamente.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!profile && !user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400">Usuário não encontrado</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.name || user?.displayName || '';
  const displayEmail = profile?.email || user?.email || '';
  const memberSince = profile?.createdAt || user?.metadata.creationTime || new Date().toISOString();
  const plan = profile?.plan || 'FREE';
  const strategiesCount = profile?.strategiesCount || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Perfil</h1>
        <p className="text-gray-600 dark:text-gray-400">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informações Pessoais</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#2D69B3] rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <Button variant="outline">Alterar Foto</Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Input 
                label="Nome" 
                placeholder="Seu nome" 
                value={editing ? name : displayName}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
              />
            </div>
            <div>
              <Input 
                label="Email" 
                type="email" 
                placeholder="seu@email.com" 
                value={displayEmail}
                disabled 
                icon={<Mail className="w-5 h-5 text-gray-400" />} 
              />
            </div>
          </div>
          {editing ? (
            <div className="flex gap-2">
              <Button onClick={handleSave}>Salvar Alterações</Button>
              <Button variant="outline" onClick={() => {
                setEditing(false);
                setName(displayName);
              }}>Cancelar</Button>
            </div>
          ) : (
            <Button onClick={() => setEditing(true)}>Editar Perfil</Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informações da Conta</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Membro desde</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(memberSince).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Plano</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {plan === 'FREE' ? 'Gratuito' : plan}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Estratégias criadas</span>
              <span className="font-medium text-gray-900 dark:text-white">{strategiesCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Zona de Perigo</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Ao deletar sua conta, todos os seus dados serão permanentemente removidos, incluindo estratégias, histórico de match hits e configurações do Telegram. Esta ação não pode ser desfeita.
          </p>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteModal(true)}
          >
            Deletar Minha Conta
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Deletar Conta
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja deletar sua conta? Esta ação é permanente e todos os seus dados serão perdidos.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Deletando...' : 'Sim, Deletar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
