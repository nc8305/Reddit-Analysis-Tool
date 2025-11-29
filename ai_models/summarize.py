"""
Text Summarization Module
Sử dụng BART model để tóm tắt văn bản
"""

from transformers import BartTokenizer, BartForConditionalGeneration
import torch

# Model name
MODEL_NAME = "sshleifer/distilbart-cnn-12-6"

# Load model và tokenizer (chỉ load 1 lần khi import)
tokenizer = BartTokenizer.from_pretrained(MODEL_NAME)
model = BartForConditionalGeneration.from_pretrained(MODEL_NAME)
model.eval()


def summarize_text(
    text,
    max_length=120,
    min_length=30,
    num_beams=4,
    length_penalty=2.0,
    no_repeat_ngram_size=3,
    early_stopping=True
):
    """
    Tóm tắt một đoạn văn bản thành câu ngắn gọn
    
    Args:
        text: Đoạn văn bản cần tóm tắt
        max_length: Độ dài tối đa của summary (default: 120 tokens)
        min_length: Độ dài tối thiểu của summary (default: 30 tokens)
        num_beams: Số beams cho beam search (default: 4, tăng lên để kết quả tốt hơn nhưng chậm hơn)
        length_penalty: Penalty cho độ dài (default: 2.0, >1.0 khuyến khích summary dài hơn)
        no_repeat_ngram_size: Tránh lặp lại n-gram (default: 3)
        early_stopping: Dừng sớm khi đạt điều kiện (default: True)
    
    Returns:
        String: Câu tóm tắt của đoạn văn bản
    """
    # Tokenize input
    inputs = tokenizer(
        text,
        max_length=1024,
        truncation=True,
        return_tensors="pt"
    )
    
    # Generate summary
    with torch.no_grad():
        summary_ids = model.generate(
            inputs["input_ids"],
            num_beams=num_beams,
            max_length=max_length,
            min_length=min_length,
            no_repeat_ngram_size=no_repeat_ngram_size,
            length_penalty=length_penalty,
            early_stopping=early_stopping
        )
    
    # Decode summary
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    
    return summary


def summarize_batch(texts, **kwargs):
    """
    Tóm tắt nhiều văn bản cùng lúc
    
    Args:
        texts: List các đoạn văn bản cần tóm tắt
        **kwargs: Các tham số giống như summarize_text()
    
    Returns:
        List các câu tóm tắt tương ứng với mỗi text
    """
    summaries = []
    for text in texts:
        summary = summarize_text(text, **kwargs)
        summaries.append(summary)
    return summaries
