import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw, X, Save, Upload, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Slide {
  id: string;
  image_url: string;
  caption: string;
  active: boolean;
  order_position: number;
  created_at: string;
}

interface SlideModalProps {
  isOpen: boolean;
  slide: Slide | null;
  onClose: () => void;
  onSave: (slideData: Partial<Slide>) => void;
  loading: boolean;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function SlideModal({ isOpen, slide, onClose, onSave, loading }: SlideModalProps) {
  const [formData, setFormData] = useState({
    image_url: '',
    caption: '',
    active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (slide) {
      setFormData({
        image_url: slide.image_url || '',
        caption: slide.caption || '',
        active: slide.active
      });
    } else {
      setFormData({
        image_url: '',
        caption: '',
        active: true
      });
    }
    setErrors({});
  }, [slide, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.image_url.trim()) {
      newErrors.image_url = 'URL da imagem é obrigatória';
    } else if (!isValidUrl(formData.image_url)) {
      newErrors.image_url = 'URL deve ter um formato válido';
    }

    if (!formData.caption.trim()) {
      newErrors.caption = 'Legenda é obrigatória';
    } else if (formData.caption.length > 200) {
      newErrors.caption = 'Legenda deve ter no máximo 200 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {slide ? 'Editar Slide' : 'Cadastrar Novo Slide'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da Imagem *
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.image_url ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Legenda *
            </label>
            <textarea
              rows={3}
              value={formData.caption}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.caption ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Legenda do slide"
              maxLength={200}
            />
            {errors.caption && <p className="text-red-500 text-sm mt-1">{errors.caption}</p>}
            <p className="text-gray-500 text-xs mt-1">
              {formData.caption.length}/200 caracteres
            </p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Slide ativo</span>
            </label>
          </div>

          {/* Preview da imagem */}
          {formData.image_url && isValidUrl(formData.image_url) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-full h-32 object-cover border border-gray-300 rounded-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [filteredSlides, setFilteredSlides] = useState<Slide[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    slideId: string;
    slideCaption: string;
  }>({ isOpen: false, slideId: '', slideCaption: '' });

  const itemsPerPage = 10;

  useEffect(() => {
    loadSlides();
  }, []);

  useEffect(() => {
    filterSlides();
  }, [slides, searchTerm]);

  const loadSlides = async () => {
    try {
      setLoading(true);

      const { data: slidesData, error } = await supabase
        .from('slides')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;

      setSlides(slidesData || []);
    } catch (error) {
      console.error('Erro ao carregar slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSlides();
    setRefreshing(false);
  };

  const filterSlides = () => {
    if (!searchTerm) {
      setFilteredSlides(slides);
      return;
    }

    const filtered = slides.filter(slide => {
      const searchLower = searchTerm.toLowerCase();
      return slide.caption.toLowerCase().includes(searchLower);
    });

    setFilteredSlides(filtered);
    setCurrentPage(1);
  };

  const handleCreateSlide = () => {
    setEditingSlide(null);
    setIsModalOpen(true);
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide(slide);
    setIsModalOpen(true);
  };

  const handleDeleteSlide = (slideId: string, slideCaption: string) => {
    setConfirmModal({ isOpen: true, slideId, slideCaption });
  };

  const handleToggleActive = async (slideId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('slides')
        .update({ active: !currentActive })
        .eq('id', slideId);

      if (error) throw error;
      
      await loadSlides();
    } catch (error) {
      console.error('Erro ao alterar status do slide:', error);
      alert('Erro ao alterar status do slide. Tente novamente.');
    }
  };

  const handleMoveSlide = async (slideId: string, direction: 'up' | 'down') => {
    try {
      const currentSlide = slides.find(s => s.id === slideId);
      if (!currentSlide) return;

      const currentPosition = currentSlide.order_position;
      const targetPosition = direction === 'up' ? currentPosition - 1 : currentPosition + 1;
      
      const targetSlide = slides.find(s => s.order_position === targetPosition);
      if (!targetSlide) return;

      // Trocar posições
      const { error: error1 } = await supabase
        .from('slides')
        .update({ order_position: targetPosition })
        .eq('id', slideId);

      const { error: error2 } = await supabase
        .from('slides')
        .update({ order_position: currentPosition })
        .eq('id', targetSlide.id);

      if (error1 || error2) throw error1 || error2;
      
      await loadSlides();
    } catch (error) {
      console.error('Erro ao mover slide:', error);
      alert('Erro ao mover slide. Tente novamente.');
    }
  };

  const handleSaveSlide = async (slideData: Partial<Slide>) => {
    try {
      setModalLoading(true);

      if (editingSlide) {
        // Editar slide existente
        const { error } = await supabase
          .from('slides')
          .update({
            image_url: slideData.image_url,
            caption: slideData.caption,
            active: slideData.active
          })
          .eq('id', editingSlide.id);

        if (error) throw error;
      } else {
        // Criar novo slide
        const maxPosition = Math.max(...slides.map(s => s.order_position), 0);
        
        const { error } = await supabase
          .from('slides')
          .insert([{
            image_url: slideData.image_url,
            caption: slideData.caption,
            active: slideData.active,
            order_position: maxPosition + 1
          }]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      await loadSlides();
    } catch (error) {
      console.error('Erro ao salvar slide:', error);
      alert('Erro ao salvar slide. Tente novamente.');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async () => {
    const { slideId } = confirmModal;
    
    try {
      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', slideId);

      if (error) throw error;
      
      await loadSlides();
    } catch (error) {
      console.error('Erro ao excluir slide:', error);
      alert('Erro ao excluir slide. Tente novamente.');
    } finally {
      setConfirmModal({ isOpen: false, slideId: '', slideCaption: '' });
    }
  };

  // Paginação
  const totalItems = filteredSlides.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredSlides.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando slides...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb e botão cadastrar */}
      <div className="flex justify-between items-center mb-6">
        <nav className="text-sm text-gray-600">
          <span>Dashboard</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">Slides</span>
        </nav>
        
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          
          <button
            onClick={handleCreateSlide}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar novo slide
          </button>
        </div>
      </div>

      {/* Campo de busca */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search filter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Imagem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Legenda
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhum slide encontrado
                </td>
              </tr>
            ) : (
              currentItems.map((slide, index) => (
                <tr key={slide.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{slide.order_position}</span>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleMoveSlide(slide.id, 'up')}
                          disabled={slide.order_position === 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveSlide(slide.id, 'down')}
                          disabled={slide.order_position === slides.length}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <img
                      src={slide.image_url}
                      alt={slide.caption}
                      className="w-16 h-12 object-cover rounded border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyNEwzMiAxNkw0MCAyNEwzMiAzMkwyNCAyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={slide.caption}>
                      {slide.caption}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <button
                      onClick={() => handleToggleActive(slide.id, slide.active)}
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        slide.active 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors`}
                    >
                      {slide.active ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Inativo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditSlide(slide)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </button>
                      
                      <button
                        onClick={() => handleDeleteSlide(slide.id, slide.caption)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> até{' '}
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de{' '}
                  <span className="font-medium">{totalItems}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &lsaquo;
                  </button>
                  
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage}
                  </span>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &rsaquo;
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Total de itens */}
      <div className="mt-4 text-sm text-gray-600">
        Total de slides: {totalItems}
      </div>

      {/* Modal de slide */}
      <SlideModal
        isOpen={isModalOpen}
        slide={editingSlide}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSlide}
        loading={modalLoading}
      />

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Excluir Slide"
        message={`Tem certeza que deseja excluir o slide "${confirmModal.slideCaption}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, slideId: '', slideCaption: '' })}
      />
    </div>
  );
}