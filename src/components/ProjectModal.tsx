import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory, LinkType } from '../types';
import { CATEGORY_OPTIONS, LINK_TYPE_OPTIONS } from '../constants';
import { generateProjectEnhancements } from '../services/geminiService';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  initialData?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    category: ProjectCategory.UXUI,
    profileOwner: 'Bukhtyar Haider',
    tags: [],
    links: []
  });
  const [tagInput, setTagInput] = useState('');
  const [linkInput, setLinkInput] = useState<{label: string, url: string, type: LinkType}>({
    label: '',
    url: '',
    type: LinkType.GITHUB
  });

  // Reset or populate form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          name: '',
          description: '',
          category: ProjectCategory.UXUI,
          profileOwner: 'Bukhtyar Haider',
          tags: [],
          links: []
        });
      }
      setTagInput('');
      setLinkInput({ label: '', url: '', type: LinkType.GITHUB });
    }
  }, [isOpen, initialData]);

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
      setLinkInput({ label: '', url: '', type: LinkType.GITHUB });
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

    const savedProject: Project = {
      id: initialData?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description || '',
      category: formData.category,
      profileOwner: formData.profileOwner || 'General',
      tags: formData.tags || [],
      links: formData.links || [],
      lastModified: Date.now()
    };
    onSave(savedProject);
    onClose();
  };

  if (!isOpen) return null;

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="glass rounded-2xl shadow-glow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all border border-white/10">
        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-surface/90 backdrop-blur-xl z-10">
          <h2 className="text-xl font-bold font-display text-white">
            {isEditMode ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Project Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-surface-highlight border border-border text-white rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-text-secondary"
                placeholder="e.g. portfolio-v3"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as ProjectCategory})}
                className="w-full px-4 py-2.5 bg-surface-highlight border border-border text-white rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
              >
                {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-surface text-white">{opt}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-text-main">Description</label>
              <button 
                type="button" 
                onClick={handleEnhance}
                disabled={loading || !formData.name}
                className="text-xs text-primary font-bold hover:text-primary-hover flex items-center gap-1 disabled:opacity-50 transition-colors uppercase tracking-wider"
              >
                {loading ? 'AI Generating...' : 'AI Enhance'} 
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
            </div>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-surface-highlight border border-border text-white rounded-xl h-28 resize-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-text-secondary"
              placeholder="Brief description of the project..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Profile / Owner</label>
              <input 
                type="text" 
                value={formData.profileOwner}
                onChange={e => setFormData({...formData, profileOwner: e.target.value})}
                className="w-full px-4 py-2.5 bg-surface-highlight border border-border text-white rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-text-secondary"
                placeholder="e.g. Bukhtyar Haider"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5">Tags (Press Enter)</label>
              <input 
                type="text" 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-4 py-2.5 bg-surface-highlight border border-border text-white rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-text-secondary"
                placeholder="Add tag..."
              />
              <div className="flex flex-wrap gap-2 mt-2.5">
                {formData.tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface text-xs font-medium text-text-main border border-border">
                    {tag}
                    <button type="button" onClick={() => setFormData({...formData, tags: formData.tags?.filter(t => t !== tag)})} className="ml-1.5 text-text-secondary hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-highlight/50 p-5 rounded-xl border border-border">
            <label className="block text-sm font-semibold text-text-main mb-3">Project Links</label>
            <div className="flex flex-col md:flex-row gap-2 mb-3">
               <select 
                value={linkInput.type}
                onChange={e => setLinkInput({...linkInput, type: e.target.value as LinkType})}
                className="px-3 py-2 bg-surface-highlight border border-border text-white rounded-lg text-sm md:w-32 focus:border-primary outline-none"
              >
                {LINK_TYPE_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-surface">{opt}</option>)}
              </select>
              <input 
                type="text" 
                value={linkInput.label}
                onChange={e => setLinkInput({...linkInput, label: e.target.value})}
                className="flex-1 px-3 py-2 bg-surface-highlight border border-border text-white rounded-lg text-sm focus:border-primary outline-none placeholder:text-text-secondary"
                placeholder="Label (e.g. Repository)"
              />
              <input 
                type="url" 
                value={linkInput.url}
                onChange={e => setLinkInput({...linkInput, url: e.target.value})}
                className="flex-1 px-3 py-2 bg-surface-highlight border border-border text-white rounded-lg text-sm focus:border-primary outline-none placeholder:text-text-secondary"
                placeholder="URL"
              />
              <button 
                type="button" 
                onClick={handleAddLink}
                className="px-4 py-2 bg-surface text-white border border-border rounded-lg text-sm font-medium hover:bg-surface-highlight transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.links?.map(link => (
                <div key={link.id} className="flex items-center justify-between text-sm bg-surface p-2.5 rounded-lg border border-border shadow-sm">
                  <span className="flex items-center gap-2 overflow-hidden">
                    <span className="font-semibold text-text-main whitespace-nowrap">{link.type}:</span>
                    <a href={link.url} target="_blank" className="text-primary hover:underline truncate">{link.label}</a>
                  </span>
                  <button type="button" onClick={() => handleRemoveLink(link.id)} className="text-red-500 hover:text-red-400 font-medium text-xs px-2 py-1 rounded hover:bg-red-900/20">Remove</button>
                </div>
              ))}
              {formData.links?.length === 0 && (
                <div className="text-center py-2 text-text-secondary text-sm italic">No links added yet.</div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2 gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-text-main font-semibold hover:bg-white/10 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary"
            >
              {isEditMode ? 'Update Project' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};