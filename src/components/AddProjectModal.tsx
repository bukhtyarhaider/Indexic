import React, { useState } from 'react';
import { Project, ProjectCategory, LinkType, ProjectLink } from '../types';
import { CATEGORY_OPTIONS, LINK_TYPE_OPTIONS } from '../constants';
import { generateProjectEnhancements } from '../services/geminiService';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: Project) => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    category: ProjectCategory.UXUI,
    profileOwner: 'General',
    tags: [],
    links: []
  });
  const [tagInput, setTagInput] = useState('');
  const [linkInput, setLinkInput] = useState<{label: string, url: string, type: LinkType}>({
    label: '',
    url: '',
    type: LinkType.FIGMA
  });

  const handleEnhance = async () => {
    if (!formData.name || !formData.category) return;
    setLoading(true);
    try {
      const { refinedDescription, suggestedTags } = await generateProjectEnhancements(
        formData.name,
        formData.description || '',
        formData.category
      );
      setFormData(prev => ({
        ...prev,
        description: refinedDescription,
        tags: Array.from(new Set([...(prev.tags || []), ...suggestedTags]))
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    if (linkInput.url && linkInput.label) {
      setFormData(prev => ({
        ...prev,
        links: [...(prev.links || []), { ...linkInput, id: Date.now().toString() }]
      }));
      setLinkInput({ label: '', url: '', type: LinkType.FIGMA });
    }
  };

  const handleRemoveLink = (id: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links?.filter(l => l.id !== id)
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description || '',
      category: formData.category,
      profileOwner: formData.profileOwner || 'General',
      tags: formData.tags || [],
      links: formData.links || [],
      lastModified: Date.now()
    };
    onAdd(newProject);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">Add New Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. Finance Dashboard"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as ProjectCategory})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <button 
                type="button" 
                onClick={handleEnhance}
                disabled={loading || !formData.name}
                className="text-xs text-primary font-medium hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? 'Thinking...' : 'AI Enhance'} 
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
            </div>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-primary outline-none"
              placeholder="Brief description of the project..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Profile / Owner</label>
              <input 
                type="text" 
                value={formData.profileOwner}
                onChange={e => setFormData({...formData, profileOwner: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. UX Team A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tags (Press Enter)</label>
              <input 
                type="text" 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="Add tag..."
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-xs text-slate-600">
                    {tag}
                    <button type="button" onClick={() => setFormData({...formData, tags: formData.tags?.filter(t => t !== tag)})} className="ml-1 text-slate-400 hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">Project Links</label>
            <div className="flex gap-2 mb-3">
               <select 
                value={linkInput.type}
                onChange={e => setLinkInput({...linkInput, type: e.target.value as LinkType})}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-32"
              >
                {LINK_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <input 
                type="text" 
                value={linkInput.label}
                onChange={e => setLinkInput({...linkInput, label: e.target.value})}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Label (e.g. Repo)"
              />
              <input 
                type="url" 
                value={linkInput.url}
                onChange={e => setLinkInput({...linkInput, url: e.target.value})}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="URL"
              />
              <button 
                type="button" 
                onClick={handleAddLink}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.links?.map(link => (
                <div key={link.id} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-slate-200">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600">{link.type}:</span>
                    <a href={link.url} target="_blank" className="text-blue-600 hover:underline truncate max-w-[200px]">{link.label}</a>
                  </span>
                  <button type="button" onClick={() => handleRemoveLink(link.id)} className="text-red-500 hover:text-red-700">Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button 
              type="submit"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white border border-border rounded-lg text-sm font-semibold hover:bg-primary-hover hover:border-white/20 transition-all"
            >
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
