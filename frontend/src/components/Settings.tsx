import { useState } from 'react';
import { downloadBackup, importData } from '../services/backup';

export default function Settings() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadBackup();
      alert('Backup downloaded successfully!');
    } catch (error) {
      console.error('Error exporting backup:', error);
      alert('Failed to export backup. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('Importing will replace all current data. Are you sure?')) {
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      await importData(text);
      alert('Data imported successfully! Please refresh the page.');
      window.location.reload();
    } catch (error) {
      console.error('Error importing backup:', error);
      alert('Failed to import backup. Please ensure it is a valid backup file.');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Data Management</h3>
          
          <div className="space-y-3">
            <div>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExporting ? 'Exporting...' : 'Export Backup'}
              </button>
              <p className="mt-1 text-sm text-gray-600">
                Download all your data as a JSON backup file.
              </p>
            </div>

            <div>
              <label className="block px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors cursor-pointer text-center">
                {isImporting ? 'Importing...' : 'Import Backup'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="hidden"
                />
              </label>
              <p className="mt-1 text-sm text-gray-600">
                Restore data from a previously exported backup file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

