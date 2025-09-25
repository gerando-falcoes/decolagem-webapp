"use client";

import { useState, useRef, useEffect } from 'react';
import { useFamilySearch } from '../hooks/useFamilySearch';
import { Search, X, Users, MapPin, User, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FamilySearchBarProps {
  onFamilySelect?: (familyId: string) => void;
  placeholder?: string;
  className?: string;
}

export function FamilySearchBar({ 
  onFamilySelect, 
  placeholder = "Buscar família por nome, CPF, cidade ou mentor...",
  className = ""
}: FamilySearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { families, isLoading } = useFamilySearch(searchQuery);
  
  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Abrir dropdown quando houver resultados
  useEffect(() => {
    if (families.length > 0 && searchQuery.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [families, searchQuery]);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleFamilyClick = (familyId: string) => {
    setIsOpen(false);
    setSearchQuery('');
    onFamilySelect?.(familyId);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getPovertyLevelColor = (level: string | null) => {
    switch (level) {
      case 'quebra de ciclo da pobreza': return 'text-green-600';
      case 'prosperidade em desenvolvimento': return 'text-green-600';
      case 'dignidade': return 'text-yellow-600';
      case 'pobreza': return 'text-orange-600';
      case 'pobreza extrema': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    if (score >= 3) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Input de busca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (families.length > 0 && searchQuery.trim()) {
              setIsOpen(true);
            }
          }}
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white rounded-lg border shadow-lg z-50">
          <div className="flex items-center justify-center text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Buscando...
          </div>
        </div>
      )}

      {/* Dropdown de resultados */}
      {isOpen && families.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto z-50 shadow-lg">
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
              {families.length} resultado{families.length !== 1 ? 's' : ''} encontrado{families.length !== 1 ? 's' : ''}
            </div>
            {families.map((family) => (
              <button
                key={family.id}
                onClick={() => handleFamilyClick(family.id)}
                className="w-full px-3 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={16} className="text-blue-600 flex-shrink-0" />
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {family.name}
                      </h4>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin size={12} />
                        <span>{family.city}, {family.state}</span>
                      </div>
                      
                      {family.mentor_email && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <User size={12} />
                          <span>{family.mentor_email.split('@')[0]}</span>
                        </div>
                      )}
                      
                      {family.cpf && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>CPF: {family.cpf}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 ml-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {family.status_aprovacao}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Nenhum resultado */}
      {isOpen && families.length === 0 && searchQuery.trim() && !isLoading && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <div className="p-4 text-center text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Nenhuma família encontrada para "{searchQuery}"</p>
            <p className="text-xs text-gray-400 mt-1">
              Tente buscar por nome, CPF, cidade ou mentor
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
