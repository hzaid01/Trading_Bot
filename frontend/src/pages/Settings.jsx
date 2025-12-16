import { useState, useEffect } from 'react';
import { Loader2, Save, Key, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { getUserSettings, updateUserSettings } from '../lib/api';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    binance_api_key: '',
    binance_secret_key: '',
    openai_api_key: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await getUserSettings();
      if (response.success) {
        setFormData(response.data);
      }
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      await updateUserSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your API keys and preferences</p>
        </div>

        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Key className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-bold text-white">API Configuration</h2>
          </div>

          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-400">
              <p className="font-medium mb-1">Optional Configuration</p>
              <p>
                Leave these fields empty to use simulated mode with pre-trained models.
                Add your own API keys for live trading data and personalized AI analysis.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-danger-500/10 border border-danger-500 text-danger-500 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-primary-500/10 border border-primary-500 text-primary-500 px-4 py-3 rounded-lg mb-6">
              Settings updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Binance API Key
              </label>
              <input
                type="text"
                name="binance_api_key"
                value={formData.binance_api_key}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Enter your Binance API key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Binance Secret Key
              </label>
              <input
                type="password"
                name="binance_secret_key"
                value={formData.binance_secret_key}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Enter your Binance secret key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                name="openai_api_key"
                value={formData.openai_api_key}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Enter your OpenAI API key"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
