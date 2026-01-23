import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, X, ArrowUpDown, MapPin, ExternalLink, Image as ImageIcon, Maximize2, Trash2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Drawer,
  DataTable,
  Textarea,
} from '../components/ui';
import MOCK_DATA from '../mocks/lost-items.json';


// --- MOCK DATA & CONFIG ---
const statusOptions = ['보관중', '인계완료', '폐기'];

const getStatusBadgeTone = (status) => {
  if (status === "인계완료") return "ok";
  if (status === "폐기") return "default";
  if (status === "보관중") return "warn";
  return "default";
};

const LostItemsPage = () => {
  const [items, setItems] = useState(MOCK_DATA);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  const sortedData = useMemo(() => {
    let data = [...items];
    if (statusFilter) {
      data = data.filter(item => item.status === statusFilter);
    }
    if (searchText) {
      const lowercasedValue = searchText.toLowerCase();
      data = data.filter(item => 
        item.lostItemCardReceiptNumber?.toLowerCase().includes(lowercasedValue) ||
        item.plate?.toLowerCase().includes(lowercasedValue) ||
        item.lostItemId?.toLowerCase().includes(lowercasedValue) ||
        item.itemName?.toLowerCase().includes(lowercasedValue)
      );
    }

    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [statusFilter, searchText, items, sortConfig]);
  
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };


  const showDrawer = (item) => {
    setSelectedItem(item);
    setFormData(JSON.parse(JSON.stringify(item))); // Deep copy
    setDrawerVisible(true);
  };

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);
    setIsEditing(false);
    setTimeout(() => { // allow for animation
        setSelectedItem(null);
        setFormData(null);
    }, 300);
  }, []);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleSave = () => {
    const newItems = items.map(item => (item.lostItemId === formData.lostItemId ? formData : item));
    setItems(newItems);
    setSelectedItem(formData);
    alert("분실물 정보가 업데이트되었습니다.");
    setIsEditing(false);
  };

  const handleFormChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const columns = [
    { key: 'lostItemId', header: '분실물ID' },
    { key: 'itemName', header: '분실물명' },
    { key: 'plate', header: '차량번호' },
    { key: 'zone', header: '존' },
    { key: 'createdAt', header: '접수일시' },
    {
      key: 'status',
      header: '처리상태',
      render: (r) => <Badge tone={getStatusBadgeTone(r.status)}>{r.status}</Badge>,
    },
  ];
  
  const renderDrawerContent = () => {
    const data = isEditing ? formData : selectedItem;
    if (!data) return null;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>분실물 기본 정보 및 처리 상태</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
             <div className="col-span-2">
                <label className="text-xs text-gray-500">분실물ID</label>
                <div className="font-medium">{data.lostItemId}</div>
              </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">분실물명</label>
              {isEditing ? (
                <Input value={data.itemName} onChange={(e) => handleFormChange('itemName', e.target.value)} />
              ) : (
                <div className="font-medium">{data.itemName}</div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">처리상태</label>
              {isEditing ? (
                <Select value={data.status} onChange={(e) => handleFormChange('status', e.target.value)}>
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </Select>
              ) : (
                <Badge tone={getStatusBadgeTone(data.status)}>{data.status}</Badge>
              )}
            </div>
            
            <div className="col-span-2 space-y-1">
              <label className="text-xs text-gray-500">상세정보</label>
              {isEditing ? (
                <Textarea value={data.itemDescription} onChange={(e) => handleFormChange('itemDescription', e.target.value)} />
              ) : (
                 <div className="text-sm bg-gray-50 p-3 rounded-md">{data.itemDescription || "-"}</div>
              )}
            </div>
            
             <div className="col-span-2 space-y-1">
              <label className="text-xs text-gray-500">분실물 사진</label>
              {(data.itemPhotos || []).length > 0 ? (
                 <div className="grid grid-cols-3 gap-2">
                    {(data.itemPhotos || []).map((photo, index) => (
                      <div key={index} className="relative group">
                        <img src={photo} alt={`p-${index}`} className="w-full h-24 object-cover rounded-md" />
                         {isEditing && (
                            <Button variant="danger" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => handleFormChange('itemPhotos', data.itemPhotos.filter((_, i) => i !== index))}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                         )}
                      </div>
                    ))}
                 </div>
              ) : (
                <div className="text-sm text-gray-500">사진 없음</div>
              )}
               {isEditing && (
                  <Button variant="secondary" onClick={() => {
                    const url = prompt("추가할 이미지 URL을 입력하세요", "https://via.placeholder.com/150");
                    if(url) handleFormChange('itemPhotos', [...(data.itemPhotos || []), url]);
                  }}>
                    <Plus className="mr-2 h-4 w-4" /> 사진 추가
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>습득 정보</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">차량번호</label>
              <div className="font-medium">{data.plate}</div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">존</label>
              <div className="font-medium">{data.zone}</div>
            </div>
             <div className="space-y-1">
              <label className="text-xs text-gray-500">접수일시</label>
              <div>{data.createdAt}</div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">처리 담당자</label>
               {isEditing ? (
                <Input value={data.handler} onChange={(e) => handleFormChange('handler', e.target.value)} />
              ) : (
                <div>{data.handler}</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>보관 및 인계 정보</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-gray-500">보관장소</label>
                 {isEditing ? (
                  <Input value={data.storageLocation} onChange={(e) => handleFormChange('storageLocation', e.target.value)} />
                ) : (
                  <div>{data.storageLocation}</div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">인계일시</label>
                {isEditing ? (
                    <Input type="datetime-local" value={data.handedOverAt ? data.handedOverAt.replace(' ', 'T') : ''} onChange={(e) => handleFormChange('handedOverAt', e.target.value.replace('T', ' '))} />
                ) : (
                  <div>{data.handedOverAt || "-"}</div>
                )}
              </div>
            </CardContent>
        </Card>

        {(data.lostItemCardReceiptNumber || isEditing) && (
            <Card>
                <CardHeader><CardTitle>카드 정보</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">카드번호</label>
                      {isEditing ? (
                        <Input value={data.lostItemCardReceiptNumber} onChange={(e) => handleFormChange('lostItemCardReceiptNumber', e.target.value)} />
                      ) : (
                        <div>{data.lostItemCardReceiptNumber}</div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">카드사</label>
                      {isEditing ? (
                        <Input value={data.lostItemCardCompanyName} onChange={(e) => handleFormChange('lostItemCardCompanyName', e.target.value)} />
                      ) : (
                        <div>{data.lostItemCardCompanyName}</div>
                      )}
                    </div>
                     <div className="space-y-1">
                      <label className="text-xs text-gray-500">카드 소유주</label>
                      {isEditing ? (
                        <Input value={data.lostItemCardHolderName} onChange={(e) => handleFormChange('lostItemCardHolderName', e.target.value)} />
                      ) : (
                        <div>{data.lostItemCardHolderName}</div>
                      )}
                    </div>
                </CardContent>
            </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-bold text-[#172B4D]">분실물 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">차량 세차 시 발생한 분실물을 관리합니다.</div>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex gap-2">
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-w-[150px]">
                    <option value="">상태 전체</option>
                    {statusOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </Select>
                <div className="relative flex-grow">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="분실물ID, 품명, 차량번호, 카드번호 검색..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        rows={sortedData}
        rowKey="lostItemId"
        onRowClick={showDrawer}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      <Drawer
        title={isEditing ? "분실물 정보 수정" : "분실물 상세 정보"}
        open={drawerVisible}
        onClose={closeDrawer}
        footer={
          <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={handleCancel}>취소</Button>
                  <Button onClick={handleSave}>저장</Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={closeDrawer}>닫기</Button>
                  <Button onClick={handleEdit}>수정</Button>
                </>
              )}
          </div>
        }
      >
        {renderDrawerContent()}
      </Drawer>
    </div>
  );
};


export default LostItemsPage;