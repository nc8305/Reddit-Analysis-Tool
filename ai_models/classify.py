from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch
import numpy as np

# Sử dụng model từ Hugging Face
model_name = "KeroBonito/classify-hate-text"
# Hoặc nếu muốn dùng model local:
# model_path = "./Classify_result/bert-sst2-model"
# model_name = model_path

THRESHOLD = 0.5  # Threshold cho binary classification (thường là 0.5)

# Mapping cho binary classification
# Model classify-hate-text thường có: 0: "non-hate", 1: "hate"
# Nếu model không có id2label trong config, sẽ dùng mapping này
LABEL_MAPPING = {
    0: "non-hate",  # Hoặc "negative" tùy model
    1: "hate"       # Hoặc "positive" tùy model
}

# Mapping từ LABEL_X sang tên thực tế (nếu model trả về LABEL_X)
LABEL_X_MAPPING = {
    "LABEL_0": "hate",
    "LABEL_1": "non-hate"
}


tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
model.eval()


def predict_sentiment(text, threshold=THRESHOLD, return_probability=False):
    """
    Dự đoán classification cho một text
    
    Args:
        text: Text cần phân loại
        threshold: Ngưỡng để phân loại (default: 0.5)
        return_probability: Nếu True, trả về thêm probability
    
    Returns:
        Nếu return_probability=False: String label (từ model config hoặc mapping)
        Nếu return_probability=True: Dict với 'label' và 'score'
    """
    # Tokenize
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=128, padding=True)
    
    # Dự đoán
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits.numpy()[0]
    
    # Chuyển logits thành probabilities (softmax cho binary classification)
    probs = torch.softmax(torch.tensor(logits), dim=-1).numpy()
    
    # Lấy prediction
    predicted_idx = np.argmax(probs)
    
    # Lấy label từ model config nếu có, nếu không dùng mapping
    if hasattr(model.config, 'id2label') and model.config.id2label:
        id2label = model.config.id2label
        if isinstance(list(id2label.keys())[0], str):
            id2label = {int(k): v for k, v in id2label.items()}
        label_key = id2label.get(predicted_idx, f"LABEL_{predicted_idx}")
        # Map từ LABEL_X sang tên thực tế nếu cần
        predicted_label = LABEL_X_MAPPING.get(label_key, label_key)
    else:
        predicted_label = LABEL_MAPPING.get(predicted_idx, f"label_{predicted_idx}")
    
    confidence = probs[predicted_idx]
    
    if return_probability:
        # Tạo probabilities dict với tên label thực tế
        prob_dict = {}
        for i, prob in enumerate(probs):
            if hasattr(model.config, 'id2label') and model.config.id2label:
                id2label = model.config.id2label
                if isinstance(list(id2label.keys())[0], str):
                    id2label = {int(k): v for k, v in id2label.items()}
                label_key = id2label.get(i, f"LABEL_{i}")
                # Map từ LABEL_X sang tên thực tế nếu cần
                label_name = LABEL_X_MAPPING.get(label_key, label_key)
            else:
                label_name = LABEL_MAPPING.get(i, f"label_{i}")
            prob_dict[label_name] = float(prob)
        
        return {
            'label': predicted_label,
            'score': float(confidence),
            'probabilities': prob_dict
        }
    else:
        return predicted_label
classify.py